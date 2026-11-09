/**
 * ============================================================================
 * TXTV_Server.gs – Tiện ích phía server dùng chung cho mọi Web App
 * Nhà máy Túi xách Trà Vinh (Chi nhánh 7 – TBS Group)
 * ----------------------------------------------------------------------------
 *  - include()          : chèn file HTML (hỗ trợ scriptlet lồng nhau)
 *  - TXTV.render()      : render trang HTML chuẩn (title, favicon, viewport)
 *  - TXTV.getUser()     : thông tin người dùng hiện tại
 *  - TVDB               : CRUD Google Sheet dạng object (có khóa ghi đồng thời)
 *  - TXTV.uploadFile()  : lưu file base64 (từ TXTV.fileToBase64) vào Google Drive
 *  - TXTV.cache()       : cache kết quả hàm bằng CacheService
 * ============================================================================
 */

/**
 * Chèn nội dung 1 file HTML vào template.
 * Dùng trong HTML bằng thẻ scriptlet "force-print":  include('TXTV_Head')
 */
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

var TXTV = {
  /** Cấu hình chung – sửa theo từng dự án */
  config: {
    appName: 'TXTV Web App',
    company: 'Nhà máy Túi xách Trà Vinh – TBS Group',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=tbsgroup.vn&sz=64',
    timezone: 'Asia/Ho_Chi_Minh'
  },

  /**
   * Render 1 trang HTML từ file template.
   * @param {string} file  Tên file HTML (vd: 'Index')
   * @param {Object} data  Dữ liệu truyền vào template (truy cập trong HTML qua biến cùng tên)
   * @param {string} title Tiêu đề tab trình duyệt
   */
  render: function (file, data, title) {
    var t = HtmlService.createTemplateFromFile(file);
    data = data || {};
    Object.keys(data).forEach(function (k) { t[k] = data[k]; });
    t.APP = TXTV.config;
    t.USER = TXTV.getUser();
    t.BASE_URL = TXTV.getBaseUrl();
    return t.evaluate()
      .setTitle(title ? title + ' | ' + TXTV.config.appName : TXTV.config.appName)
      .setFaviconUrl(TXTV.config.faviconUrl)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  },

  /** URL Web App hiện tại (dùng để điều hướng giữa các trang: BASE_URL + '?page=...') */
  getBaseUrl: function () {
    try { return ScriptApp.getService().getUrl(); } catch (e) { return ''; }
  },

  /** Thông tin người dùng đang truy cập */
  getUser: function () {
    var email = '';
    try { email = Session.getActiveUser().getEmail(); } catch (e) {}
    var name = email ? email.split('@')[0].replace(/[._]/g, ' ') : 'Khách';
    return { email: email, name: name, initials: name.split(' ').map(function (s) { return s.charAt(0); }).join('').slice(0, 2).toUpperCase() };
  },

  /** Định dạng ngày giờ theo giờ Việt Nam */
  formatDate: function (date, pattern) {
    return Utilities.formatDate(date || new Date(), TXTV.config.timezone, pattern || 'dd/MM/yyyy HH:mm:ss');
  },

  /** Chuyển object có Date thành an toàn để trả về client (google.script.run không truyền được Date trong 1 số trường hợp) */
  toClient: function (obj) {
    return JSON.parse(JSON.stringify(obj, function (k, v) {
      return (this[k] instanceof Date) ? Utilities.formatDate(this[k], TXTV.config.timezone, "yyyy-MM-dd'T'HH:mm:ss") : v;
    }));
  },

  /**
   * Lưu file (từ TXTV.fileToBase64 phía client) vào thư mục Drive.
   * @return {{id:string,name:string,url:string}}
   */
  uploadFile: function (fileObj, folderId) {
    var blob = Utilities.newBlob(Utilities.base64Decode(fileObj.data), fileObj.mimeType, fileObj.name);
    var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    var file = folder.createFile(blob);
    return { id: file.getId(), name: file.getName(), url: file.getUrl() };
  },

  /**
   * Cache kết quả của 1 hàm (mặc định 10 phút).
   *   var data = TXTV.cache('employees', function(){ return TVDB.getAll('NhanVien'); }, 600);
   */
  cache: function (key, fn, seconds) {
    var c = CacheService.getScriptCache();
    var hit = c.get(key);
    if (hit) return JSON.parse(hit);
    var val = fn();
    try { c.put(key, JSON.stringify(val), seconds || 600); } catch (e) { /* vượt 100KB thì bỏ qua cache */ }
    return val;
  },
  clearCache: function (key) { CacheService.getScriptCache().remove(key); }
};

/**
 * ============================================================================
 * TVDB – Thao tác Google Sheet như 1 bảng dữ liệu
 *  - Dòng 1 là tiêu đề cột (header). Cột đầu tiên nên là "id".
 *  - Mặc định dùng Spreadsheet gắn với script; đặt TVDB.SPREADSHEET_ID để dùng file khác.
 *
 *  TVDB.getAll('NhanVien')                      -> [{id, ten, ...}]
 *  TVDB.find('NhanVien', function(r){ return r.boPhan === 'May'; })
 *  TVDB.findById('NhanVien', 'NV001')
 *  TVDB.insert('NhanVien', { ten: 'A' })        -> tự sinh id, createdAt, createdBy (nếu có cột)
 *  TVDB.update('NhanVien', 'NV001', { ten: 'B' })
 *  TVDB.remove('NhanVien', 'NV001')
 * ============================================================================
 */
var TVDB = {
  SPREADSHEET_ID: '',

  ss: function () {
    return TVDB.SPREADSHEET_ID ? SpreadsheetApp.openById(TVDB.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  },

  sheet: function (name) {
    var sh = TVDB.ss().getSheetByName(name);
    if (!sh) throw new Error('Không tìm thấy sheet "' + name + '"');
    return sh;
  },

  /** Tạo sheet với tiêu đề nếu chưa có */
  ensureSheet: function (name, headers) {
    var ss = TVDB.ss(), sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#00402a').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    return sh;
  },

  headers: function (name) {
    var sh = TVDB.sheet(name);
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  },

  getAll: function (name) {
    var sh = TVDB.sheet(name), values = sh.getDataRange().getValues();
    if (values.length < 2) return [];
    var head = values.shift().map(String);
    return values
      .filter(function (r) { return r.join('') !== ''; })
      .map(function (r) {
        var o = {};
        head.forEach(function (h, i) { if (h) o[h] = r[i]; });
        return o;
      });
  },

  find: function (name, predicate) { return TVDB.getAll(name).filter(predicate); },

  findById: function (name, id, idField) {
    idField = idField || 'id';
    return TVDB.getAll(name).filter(function (r) { return String(r[idField]) === String(id); })[0] || null;
  },

  /** Sinh mã: prefix + yyMMdd + 4 ký tự ngẫu nhiên. vd: NV2611091A2B */
  newId: function (prefix) {
    return (prefix || '') + Utilities.formatDate(new Date(), TXTV.config.timezone, 'yyMMdd') +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  },

  insert: function (name, obj, opts) {
    opts = opts || {};
    return TVDB._withLock(function () {
      var sh = TVDB.sheet(name), head = TVDB.headers(name);
      var now = new Date(), user = TXTV.getUser().email;
      obj = Object.assign({}, obj);
      if (head.indexOf('id') !== -1 && !obj.id) obj.id = TVDB.newId(opts.prefix);
      if (head.indexOf('createdAt') !== -1) obj.createdAt = now;
      if (head.indexOf('createdBy') !== -1) obj.createdBy = user;
      if (head.indexOf('updatedAt') !== -1) obj.updatedAt = now;
      if (head.indexOf('updatedBy') !== -1) obj.updatedBy = user;
      sh.appendRow(head.map(function (h) { return obj[h] !== undefined ? obj[h] : ''; }));
      return obj;
    });
  },

  update: function (name, id, patch, idField) {
    idField = idField || 'id';
    return TVDB._withLock(function () {
      var sh = TVDB.sheet(name), values = sh.getDataRange().getValues(), head = values[0].map(String);
      var col = head.indexOf(idField);
      if (col === -1) throw new Error('Sheet "' + name + '" không có cột ' + idField);
      for (var r = 1; r < values.length; r++) {
        if (String(values[r][col]) === String(id)) {
          var row = values[r].slice();
          patch = Object.assign({}, patch);
          if (head.indexOf('updatedAt') !== -1) patch.updatedAt = new Date();
          if (head.indexOf('updatedBy') !== -1) patch.updatedBy = TXTV.getUser().email;
          head.forEach(function (h, i) { if (h !== idField && patch[h] !== undefined) row[i] = patch[h]; });
          sh.getRange(r + 1, 1, 1, row.length).setValues([row]);
          var o = {}; head.forEach(function (h, i) { o[h] = row[i]; });
          return o;
        }
      }
      throw new Error('Không tìm thấy bản ghi ' + id);
    });
  },

  remove: function (name, id, idField) {
    idField = idField || 'id';
    return TVDB._withLock(function () {
      var sh = TVDB.sheet(name), values = sh.getDataRange().getValues(), col = values[0].map(String).indexOf(idField);
      for (var r = values.length - 1; r >= 1; r--) {
        if (String(values[r][col]) === String(id)) { sh.deleteRow(r + 1); return true; }
      }
      return false;
    });
  },

  _withLock: function (fn) {
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try { return fn(); } finally { lock.releaseLock(); }
  }
};

/**
 * ============================================================================
 * MỞ RỘNG v1.1 – TVDB nâng cao, Email, PDF, Nhật ký, Phân quyền, Cài đặt
 * ============================================================================
 */

/**
 * Truy vấn có lọc / tìm kiếm / sắp xếp / phân trang (gọi được từ client vì chỉ dùng tham số JSON).
 *   TVDB.query('NhanVien', { where: { boPhan: 'May' }, search: 'nguyen', searchKeys: ['ten'],
 *                            sort: 'ten', desc: false, page: 1, pageSize: 20 })
 *   -> { rows, total, page, pageSize, totalPages }
 */
TVDB.query = function (name, q) {
  q = q || {};
  var rows = TVDB.getAll(name);
  if (q.where) {
    rows = rows.filter(function (r) {
      return Object.keys(q.where).every(function (k) {
        var w = q.where[k];
        return Array.isArray(w) ? w.map(String).indexOf(String(r[k])) !== -1 : String(r[k]) === String(w);
      });
    });
  }
  if (q.search) {
    var norm = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); };
    var needle = norm(q.search);
    rows = rows.filter(function (r) {
      return (q.searchKeys || Object.keys(r)).some(function (k) { return r[k] !== '' && norm(r[k]).indexOf(needle) !== -1; });
    });
  }
  if (q.sort) {
    var d = q.desc ? -1 : 1;
    rows.sort(function (a, b) { var x = a[q.sort], y = b[q.sort]; return (x > y ? 1 : x < y ? -1 : 0) * d; });
  }
  var total = rows.length, size = q.pageSize || total || 1, page = Math.max(1, q.page || 1);
  return TXTV.toClient({ rows: rows.slice((page - 1) * size, page * size), total: total, page: page, pageSize: size, totalPages: Math.max(1, Math.ceil(total / size)) });
};

/** Thêm nhiều dòng một lần (nhanh hơn insert từng dòng – dùng cho nhập Excel) */
TVDB.insertMany = function (name, list, opts) {
  opts = opts || {};
  return TVDB._withLock(function () {
    var sh = TVDB.sheet(name), head = TVDB.headers(name), now = new Date(), user = TXTV.getUser().email;
    var out = (list || []).map(function (o) {
      o = Object.assign({}, o);
      if (head.indexOf('id') !== -1 && !o.id) o.id = TVDB.newId(opts.prefix);
      if (head.indexOf('createdAt') !== -1) o.createdAt = now;
      if (head.indexOf('createdBy') !== -1) o.createdBy = user;
      return o;
    });
    if (out.length) sh.getRange(sh.getLastRow() + 1, 1, out.length, head.length).setValues(out.map(function (o) { return head.map(function (h) { return o[h] !== undefined ? o[h] : ''; }); }));
    return out.length;
  });
};

/** Cập nhật nếu đã có id, ngược lại thêm mới */
TVDB.upsert = function (name, obj, idField, opts) {
  idField = idField || 'id';
  if (obj[idField] && TVDB.findById(name, obj[idField], idField)) return TVDB.update(name, obj[idField], obj, idField);
  return TVDB.insert(name, obj, opts);
};

/** Đếm số dòng theo điều kiện where */
TVDB.count = function (name, where) { return TVDB.query(name, { where: where }).total; };

/**
 * Gửi email với khung giao diện thương hiệu TBS.
 *   TXTV.sendMail({ to, cc, subject, title, html, button: { text, url }, attachments })
 */
TXTV.sendMail = function (o) {
  MailApp.sendEmail({
    to: o.to, cc: o.cc || '', bcc: o.bcc || '', subject: o.subject,
    htmlBody: TXTV.emailTemplate(o.title || o.subject, o.html || '', o.button),
    attachments: o.attachments || [], name: o.senderName || TXTV.config.appName
  });
  return true;
};
TXTV.emailTemplate = function (title, bodyHtml, button) {
  return '<div style="background:#f1f5f9;padding:24px 0;font-family:Inter,Segoe UI,Arial,sans-serif">' +
    '<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">' +
    '<tr><td style="background:#00402a;padding:18px 24px;color:#fff"><b style="font-size:16px">' + TXTV.config.company + '</b>' +
    '<div style="font-size:12px;color:#a6ce39">' + TXTV.config.appName + '</div></td></tr>' +
    '<tr><td style="padding:24px"><h2 style="margin:0 0 12px;font-size:18px;color:#0f172a">' + title + '</h2>' +
    '<div style="font-size:14px;line-height:1.6;color:#334155">' + bodyHtml + '</div>' +
    (button ? '<p style="margin:24px 0 0"><a href="' + button.url + '" style="background:#0b5a41;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">' + button.text + '</a></p>' : '') +
    '</td></tr><tr><td style="padding:14px 24px;background:#f8fafc;font-size:11px;color:#94a3b8">Email tự động – vui lòng không trả lời.</td></tr></table></div>';
};

/**
 * Chuyển HTML thành PDF, trả về base64 để client tải: TXTV.downloadBase64(r.data, r.name, r.mimeType)
 * Gợi ý: dựng HTML từ template: HtmlService.createTemplateFromFile('PhieuIn').evaluate().getContent()
 */
TXTV.htmlToPdf = function (html, filename, folderId) {
  var blob = Utilities.newBlob(html, 'text/html', 'tmp.html').getAs('application/pdf').setName((filename || 'tai-lieu') + '.pdf');
  var res = { name: blob.getName(), mimeType: 'application/pdf', data: Utilities.base64Encode(blob.getBytes()) };
  if (folderId) res.url = DriveApp.getFolderById(folderId).createFile(blob).getUrl();
  return res;
};

/**
 * Nhật ký thao tác (audit log) – ghi vào sheet "NhatKy"
 *   TXTV.audit('DUYET_PHIEU', { id: 'PX001' })
 */
TXTV.audit = function (action, detail) {
  try {
    var sh = TVDB.ensureSheet('NhatKy', ['thoiGian', 'nguoiDung', 'hanhDong', 'chiTiet']);
    sh.appendRow([new Date(), TXTV.getUser().email, action, typeof detail === 'string' ? detail : JSON.stringify(detail || {})]);
  } catch (e) { console.warn('audit lỗi: ' + e.message); }
};

/**
 * Phân quyền theo sheet "PhanQuyen" (cột: email | role)  – role ví dụ: admin, quanly, nhanvien
 *   TXTV.getRole()                       -> 'admin' | '' (không có quyền)
 *   TXTV.requireRole(['admin','quanly']) -> ném lỗi nếu không đủ quyền (dùng đầu hàm server)
 */
TXTV.getRole = function (email) {
  email = String(email || TXTV.getUser().email).toLowerCase();
  return TXTV.cache('role:' + email, function () {
    try {
      var r = TVDB.getAll('PhanQuyen').filter(function (x) { return String(x.email).toLowerCase() === email; })[0];
      return r ? String(r.role) : '';
    } catch (e) { return ''; }
  }, 300);
};
TXTV.requireRole = function (roles) {
  roles = [].concat(roles);
  var role = TXTV.getRole();
  if (roles.indexOf(role) === -1) throw new Error('Bạn không có quyền thực hiện thao tác này');
  return role;
};

/**
 * Cài đặt ứng dụng lưu bằng PropertiesService (JSON)
 *   TXTV.settings.get('ngayChotSo', 25); TXTV.settings.set('ngayChotSo', 26); TXTV.settings.all()
 */
TXTV.settings = {
  _p: function () { return PropertiesService.getScriptProperties(); },
  get: function (key, def) { var v = TXTV.settings._p().getProperty(key); if (v === null) return def; try { return JSON.parse(v); } catch (e) { return v; } },
  set: function (key, val) { TXTV.settings._p().setProperty(key, JSON.stringify(val)); return val; },
  all: function () { var o = TXTV.settings._p().getProperties(); Object.keys(o).forEach(function (k) { try { o[k] = JSON.parse(o[k]); } catch (e) {} }); return o; },
  remove: function (key) { TXTV.settings._p().deleteProperty(key); }
};

/** Lấy giá trị dạng danh mục (dropdown) từ 1 cột của sheet: [{value,label}] */
TXTV.getOptions = function (sheetName, valueKey, labelKey) {
  return TVDB.getAll(sheetName).map(function (r) { return { value: r[valueKey], label: r[labelKey || valueKey] }; });
};
