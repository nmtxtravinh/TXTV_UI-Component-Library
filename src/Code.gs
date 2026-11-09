/**
 * ============================================================================
 * Code.gs – Điểm vào của Web App (doGet) + hàm demo cho trang tài liệu
 * ============================================================================
 *  Các trang:   ?page=Index (mặc định – thư viện component)
 *               ?page=Starter (mẫu trang trống để bắt đầu dự án mới)
 *               ?page=Login   (mẫu trang đăng nhập)
 *               ?page=Crud    (mẫu quản lý danh mục: thêm/sửa/xóa, nhập/xuất Excel – lưu Google Sheet)
 *               ?page=Dashboard (mẫu báo cáo sản xuất: KPI, OEE, biểu đồ, pivot, Gantt)
 *               ?page=Mobile    (mẫu nhập sản lượng theo giờ cho tablet/điện thoại tại chuyền)
 */

var PAGES = {
  Index:     'Thư viện UI',
  Starter:   'Trang mẫu',
  Login:     'Đăng nhập',
  Crud:      'Quản lý vật tư',
  Dashboard: 'Báo cáo sản xuất',
  Mobile:    'Nhập sản lượng'
};

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'Index';
  TXTV.config.appName = 'TXTV';
  if (!PAGES[page]) return TXTV.errorPage(404);
  return TXTV.render(page, { PAGE: page, PARAMS: (e && e.parameter) || {} }, PAGES[page]);
}

/* ---------------------------------------------------------------------------
 * HÀM DEMO (gọi từ client bằng TXTV.run / TXTV.call)
 * ------------------------------------------------------------------------- */

/** Trả về danh sách nhân viên giả lập để demo DataTable */
function demo_getEmployees() {
  var ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Võ', 'Thạch', 'Kim', 'Sơn', 'Dương'];
  var dem = ['Thị', 'Văn', 'Minh', 'Ngọc', 'Thanh', 'Hoàng'];
  var ten = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Khánh', 'Linh', 'Nam', 'Phúc', 'Sương', 'Tâm', 'Vy'];
  var bp = ['May', 'Cắt', 'Hoàn thiện', 'QC', 'Kho', 'Kỹ thuật', 'Văn phòng'];
  var tt = ['Đang làm', 'Đang làm', 'Đang làm', 'Nghỉ phép', 'Thử việc'];
  var rows = [];
  for (var i = 1; i <= 57; i++) {
    rows.push({
      id: 'NV' + ('000' + i).slice(-4),
      name: ho[i % ho.length] + ' ' + dem[i % dem.length] + ' ' + ten[(i * 7) % ten.length],
      dept: bp[(i * 3) % bp.length],
      status: tt[(i * 3) % tt.length],
      output: 80 + ((i * 37) % 70),
      salary: 6500000 + ((i * 131) % 40) * 100000,
      joined: Utilities.formatDate(new Date(2018 + (i % 7), i % 12, (i % 27) + 1), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd')
    });
  }
  return rows;
}

/** Giả lập lưu form */
function demo_saveForm(data) {
  if (!data || !data.fullName) throw new Error('Thiếu họ tên');
  Utilities.sleep(600);
  return { ok: true, id: TVDB.newId('PX'), savedAt: TXTV.formatDate(new Date()), data: data };
}

/** Giả lập lỗi server */
function demo_fail() {
  throw new Error('Không kết nối được Google Sheet (lỗi demo)');
}

/** Demo đăng nhập cho trang Login (thay bằng kiểm tra tài khoản thật, vd: TVDB.findById('TaiKhoan', ...)) */
function demo_login(data) {
  if (!data || data.password !== '1234') throw new Error('Sai mã nhân viên hoặc mật khẩu (demo: mật khẩu 1234)');
  return { ok: true, username: data.username };
}

/* ---------------------------------------------------------------------------
 * MẪU CRUD (trang Crud.html) – lưu vào sheet "DemoVatTu"
 *  - Nếu script gắn với Google Sheet: dùng file đó.
 *  - Nếu là script độc lập: tự tạo file "TXTV Demo – Vật tư" trong Drive lần đầu chạy.
 * ------------------------------------------------------------------------- */
var CRUD_SHEET = 'DemoVatTu';
var CRUD_HEADERS = ['id', 'maVT', 'tenVT', 'nhom', 'donVi', 'tonKho', 'donGia', 'ghiChu', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];

function crudInit_() {
  if (!TVDB.SPREADSHEET_ID && !SpreadsheetApp.getActiveSpreadsheet()) {
    var props = PropertiesService.getScriptProperties(), id = props.getProperty('DEMO_SS_ID');
    if (!id) { id = SpreadsheetApp.create('TXTV Demo – Vật tư').getId(); props.setProperty('DEMO_SS_ID', id); }
    TVDB.SPREADSHEET_ID = id;
  }
  TVDB.ensureSheet(CRUD_SHEET, CRUD_HEADERS);
}

function crud_list() {
  crudInit_();
  return TXTV.toClient(TVDB.getAll(CRUD_SHEET));
}

function crud_save(obj) {
  crudInit_();
  if (!obj || !obj.maVT || !obj.tenVT) throw new Error('Thiếu mã hoặc tên vật tư');
  var dup = TVDB.find(CRUD_SHEET, function (r) { return String(r.maVT).toUpperCase() === String(obj.maVT).toUpperCase() && String(r.id) !== String(obj.id || ''); });
  if (dup.length) throw new Error('Mã vật tư "' + obj.maVT + '" đã tồn tại');
  var saved = obj.id ? TVDB.update(CRUD_SHEET, obj.id, obj) : TVDB.insert(CRUD_SHEET, obj, { prefix: 'VT' });
  TXTV.audit(obj.id ? 'SUA_VAT_TU' : 'THEM_VAT_TU', { id: saved.id, maVT: saved.maVT });
  return TXTV.toClient(saved);
}

function crud_delete(id) {
  crudInit_();
  var ok = TVDB.remove(CRUD_SHEET, id);
  if (ok) TXTV.audit('XOA_VAT_TU', { id: id });
  return ok;
}

function crud_import(rows) {
  crudInit_();
  var n = TVDB.insertMany(CRUD_SHEET, (rows || []).filter(function (r) { return r.maVT && r.tenVT; }), { prefix: 'VT' });
  TXTV.audit('NHAP_EXCEL_VAT_TU', { soDong: n });
  return n;
}

/* ---------------------------------------------------------------------------
 * MẪU DASHBOARD (Dashboard.html) – dữ liệu sản xuất giả lập
 * Thay demoProduction_() bằng TVDB.getAll('SanLuong') khi dùng thật.
 * ------------------------------------------------------------------------- */
function parseIsoDate_(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

function dash_getData(range) {
  var to = (range && parseIsoDate_(range.to)) || new Date();
  var from = (range && parseIsoDate_(range.from)) || new Date(to.getFullYear(), to.getMonth(), to.getDate() - 13);
  return { rows: demoProduction_(from, to), plan: demoPlan_() };
}

function demoProduction_(from, to) {
  var lines = ['May 1', 'May 2', 'May 3', 'May 4', 'May 5'], rows = [];
  for (var d = new Date(from.getFullYear(), from.getMonth(), from.getDate()); d <= to; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) continue;
    lines.forEach(function (l, i) {
      var seed = d.getDate() * 7 + i * 13 + d.getMonth() * 3, plan = 1800 + i * 100;
      var out = Math.round(plan * (0.82 + (seed % 23) / 100));
      rows.push({ date: Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'), line: l, plan: plan, output: out,
        defect: Math.round(out * (0.01 + (seed % 5) / 200)), downtime: (seed * 11) % 45 });
    });
  }
  return rows;
}

function demoPlan_() {
  var t = new Date(), iso = function (k) { return Utilities.formatDate(new Date(t.getFullYear(), t.getMonth(), t.getDate() + k), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'); };
  return [
    { id: 'PO-2598', label: 'PO-2598 · Ví da', sub: 'May 3', start: iso(-9), end: iso(-1), progress: 100 },
    { id: 'PO-2605', label: 'PO-2605 · Balo PU', sub: 'May 2', start: iso(-6), end: iso(-1), progress: 85 },
    { id: 'PO-2611', label: 'PO-2611 · Túi tote', sub: 'May 1, May 4', start: iso(-4), end: iso(6), progress: 55 },
    { id: 'PO-2615', label: 'PO-2615 · Túi du lịch', sub: 'May 5', start: iso(1), end: iso(12), progress: 0 },
    { id: 'PO-2620', label: 'PO-2620 · Ví cầm tay', sub: 'May 3', start: iso(3), end: iso(9), progress: 0 }
  ];
}

/* ---------------------------------------------------------------------------
 * MẪU NHẬP SẢN LƯỢNG (Mobile.html) – lưu sheet "DemoSanLuong"
 * ------------------------------------------------------------------------- */
var OUTPUT_SHEET = 'DemoSanLuong';
var OUTPUT_HEADERS = ['id', 'ngay', 'chuyen', 'gio', 'keHoach', 'thucHien', 'loi', 'ghiChu', 'createdAt', 'createdBy'];

function output_load(line, date) {
  crudInit_();
  TVDB.ensureSheet(OUTPUT_SHEET, OUTPUT_HEADERS);
  return TXTV.toClient(TVDB.find(OUTPUT_SHEET, function (r) {
    return r.chuyen === line && Utilities.formatDate(new Date(r.ngay), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd') === date;
  }));
}

function output_save(payload) {
  if (!payload || !payload.line || !payload.date) throw new Error('Thiếu chuyền hoặc ngày');
  crudInit_();
  TVDB.ensureSheet(OUTPUT_SHEET, OUTPUT_HEADERS);
  output_load(payload.line, payload.date).forEach(function (r) { TVDB.remove(OUTPUT_SHEET, r.id); });
  var rows = (payload.rows || []).filter(function (r) { return r.thucHien !== '' && r.thucHien !== null && r.thucHien !== undefined; })
    .map(function (r) { return { ngay: parseIsoDate_(payload.date), chuyen: payload.line, gio: r.gio, keHoach: r.keHoach, thucHien: r.thucHien, loi: r.loi || 0, ghiChu: r.ghiChu || '' }; });
  var n = TVDB.insertMany(OUTPUT_SHEET, rows, { prefix: 'SL' });
  TXTV.audit('NHAP_SAN_LUONG', { chuyen: payload.line, ngay: payload.date, soDong: n });
  return { saved: n, at: TXTV.formatDate(new Date(), 'HH:mm') };
}
