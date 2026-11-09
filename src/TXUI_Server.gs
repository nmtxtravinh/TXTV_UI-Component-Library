/**
 * ============================================================================
 * TXUI_Server.gs – Tiện ích phía server dùng chung cho mọi Web App
 * Nhà máy Túi xách Trà Vinh (Chi nhánh 7 – TBS Group)
 * ----------------------------------------------------------------------------
 *  - include()          : chèn file HTML (hỗ trợ scriptlet lồng nhau)
 *  - TXUI.render()      : render trang HTML chuẩn (title, favicon, viewport)
 *  - TXUI.getUser()     : thông tin người dùng hiện tại
 *  - TXDB               : CRUD Google Sheet dạng object (có khóa ghi đồng thời)
 *  - TXUI.uploadFile()  : lưu file base64 (từ TXUI.fileToBase64) vào Google Drive
 *  - TXUI.cache()       : cache kết quả hàm bằng CacheService
 * ============================================================================
 */

/**
 * Chèn nội dung 1 file HTML vào template.
 * Dùng trong HTML bằng thẻ scriptlet "force-print":  include('TXUI_Head')
 */
function include(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
}

var TXUI = {
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
    t.APP = TXUI.config;
    t.USER = TXUI.getUser();
    t.BASE_URL = TXUI.getBaseUrl();
    return t.evaluate()
      .setTitle(title ? title + ' | ' + TXUI.config.appName : TXUI.config.appName)
      .setFaviconUrl(TXUI.config.faviconUrl)
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
    return Utilities.formatDate(date || new Date(), TXUI.config.timezone, pattern || 'dd/MM/yyyy HH:mm:ss');
  },

  /** Chuyển object có Date thành an toàn để trả về client (google.script.run không truyền được Date trong 1 số trường hợp) */
  toClient: function (obj) {
    return JSON.parse(JSON.stringify(obj, function (k, v) {
      return (this[k] instanceof Date) ? Utilities.formatDate(this[k], TXUI.config.timezone, "yyyy-MM-dd'T'HH:mm:ss") : v;
    }));
  },

  /**
   * Lưu file (từ TXUI.fileToBase64 phía client) vào thư mục Drive.
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
   *   var data = TXUI.cache('employees', function(){ return TXDB.getAll('NhanVien'); }, 600);
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
 * TXDB – Thao tác Google Sheet như 1 bảng dữ liệu
 *  - Dòng 1 là tiêu đề cột (header). Cột đầu tiên nên là "id".
 *  - Mặc định dùng Spreadsheet gắn với script; đặt TXDB.SPREADSHEET_ID để dùng file khác.
 *
 *  TXDB.getAll('NhanVien')                      -> [{id, ten, ...}]
 *  TXDB.find('NhanVien', function(r){ return r.boPhan === 'May'; })
 *  TXDB.findById('NhanVien', 'NV001')
 *  TXDB.insert('NhanVien', { ten: 'A' })        -> tự sinh id, createdAt, createdBy (nếu có cột)
 *  TXDB.update('NhanVien', 'NV001', { ten: 'B' })
 *  TXDB.remove('NhanVien', 'NV001')
 * ============================================================================
 */
var TXDB = {
  SPREADSHEET_ID: '',

  ss: function () {
    return TXDB.SPREADSHEET_ID ? SpreadsheetApp.openById(TXDB.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  },

  sheet: function (name) {
    var sh = TXDB.ss().getSheetByName(name);
    if (!sh) throw new Error('Không tìm thấy sheet "' + name + '"');
    return sh;
  },

  /** Tạo sheet với tiêu đề nếu chưa có */
  ensureSheet: function (name, headers) {
    var ss = TXDB.ss(), sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#00402a').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    return sh;
  },

  headers: function (name) {
    var sh = TXDB.sheet(name);
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  },

  getAll: function (name) {
    var sh = TXDB.sheet(name), values = sh.getDataRange().getValues();
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

  find: function (name, predicate) { return TXDB.getAll(name).filter(predicate); },

  findById: function (name, id, idField) {
    idField = idField || 'id';
    return TXDB.getAll(name).filter(function (r) { return String(r[idField]) === String(id); })[0] || null;
  },

  /** Sinh mã: prefix + yyMMdd + 4 ký tự ngẫu nhiên. vd: NV2611091A2B */
  newId: function (prefix) {
    return (prefix || '') + Utilities.formatDate(new Date(), TXUI.config.timezone, 'yyMMdd') +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  },

  insert: function (name, obj, opts) {
    opts = opts || {};
    return TXDB._withLock(function () {
      var sh = TXDB.sheet(name), head = TXDB.headers(name);
      var now = new Date(), user = TXUI.getUser().email;
      obj = Object.assign({}, obj);
      if (head.indexOf('id') !== -1 && !obj.id) obj.id = TXDB.newId(opts.prefix);
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
    return TXDB._withLock(function () {
      var sh = TXDB.sheet(name), values = sh.getDataRange().getValues(), head = values[0].map(String);
      var col = head.indexOf(idField);
      if (col === -1) throw new Error('Sheet "' + name + '" không có cột ' + idField);
      for (var r = 1; r < values.length; r++) {
        if (String(values[r][col]) === String(id)) {
          var row = values[r].slice();
          patch = Object.assign({}, patch);
          if (head.indexOf('updatedAt') !== -1) patch.updatedAt = new Date();
          if (head.indexOf('updatedBy') !== -1) patch.updatedBy = TXUI.getUser().email;
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
    return TXDB._withLock(function () {
      var sh = TXDB.sheet(name), values = sh.getDataRange().getValues(), col = values[0].map(String).indexOf(idField);
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
