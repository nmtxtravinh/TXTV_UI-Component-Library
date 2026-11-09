/**
 * ============================================================================
 * Code.gs – Điểm vào của Web App (doGet) + hàm demo cho trang tài liệu
 * ============================================================================
 *  Các trang:   ?page=Index (mặc định – thư viện component)
 *               ?page=Starter (mẫu trang trống để bắt đầu dự án mới)
 *               ?page=Login   (mẫu trang đăng nhập)
 */

var PAGES = {
  Index:   'Thư viện UI',
  Starter: 'Trang mẫu',
  Login:   'Đăng nhập'
};

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'Index';
  if (!PAGES[page]) page = 'Index';
  TXUI.config.appName = 'TXUI';
  return TXUI.render(page, { PAGE: page, PARAMS: (e && e.parameter) || {} }, PAGES[page]);
}

/* ---------------------------------------------------------------------------
 * HÀM DEMO (gọi từ client bằng TXUI.run / TXUI.call)
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
  return { ok: true, id: TXDB.newId('PX'), savedAt: TXUI.formatDate(new Date()), data: data };
}

/** Giả lập lỗi server */
function demo_fail() {
  throw new Error('Không kết nối được Google Sheet (lỗi demo)');
}

/** Demo đăng nhập cho trang Login (thay bằng kiểm tra tài khoản thật, vd: TXDB.findById('TaiKhoan', ...)) */
function demo_login(data) {
  if (!data || data.password !== '1234') throw new Error('Sai mã nhân viên hoặc mật khẩu (demo: mật khẩu 1234)');
  return { ok: true, username: data.username };
}
