/**
 * NMTXTV Digital Workspace – Code.gs
 * Cổng truy cập các ứng dụng nội bộ của Nhà máy Túi xách Trà Vinh.
 */

var PAGES = { Index: 'NMTXTV Digital Workspace' };

/**
 * Danh mục ứng dụng.
 *  - url: để trống khi chưa có liên kết; điền link Web App / trang đích để mở được.
 *  - scope: 'noibo' (nội bộ nhà máy) | 'nganh' (dùng chung toàn ngành).
 *  - color: mã màu ô icon (mỗi app một màu).
 */
var APP_GROUPS = [
  { id: 'sanxuat', name: 'Sản xuất' },
  { id: 'caitien', name: 'Cải tiến' },
  { id: 'nhansu',  name: 'Nhân sự' }
];

var APPS = [
  { id: 'dhsx',     group: 'sanxuat', name: 'HT Số hoá ĐHSX',            scope: 'nganh', icon: 'fa-clipboard-list',       color: '#2563EB', url: '' },
  { id: 'ccdc',     group: 'sanxuat', name: 'Đề nghị CCDC',              scope: 'noibo', icon: 'fa-screwdriver-wrench',   color: '#EA580C', url: '' },
  { id: 'mmtb',     group: 'sanxuat', name: 'HTQL MMTB',                 scope: 'nganh', icon: 'fa-gears',                color: '#475569', url: '' },
  { id: 'ytuong',   group: 'caitien', name: 'HTQL Ý tưởng Cải tiến',     scope: 'noibo', icon: 'fa-lightbulb',            color: '#D97706', url: '' },
  { id: 'gemba',    group: 'caitien', name: 'Gemba Pro',                 scope: 'nganh', icon: 'fa-person-walking',       color: '#0F766E', url: '' },
  { id: 'thuvien',  group: 'caitien', name: 'Thư viện Cải tiến',         scope: 'nganh', icon: 'fa-book-bookmark',        color: '#7C3AED', url: '' },
  { id: 'luong',    group: 'nhansu',  name: 'Phiếu lương',               scope: 'noibo', icon: 'fa-money-check-dollar',   color: '#4F46E5', url: '' },
  { id: 'congphep', group: 'nhansu',  name: 'HTQL Công - Phép',          scope: 'noibo', icon: 'fa-calendar-check',       color: '#E11D48', url: '' },
  { id: 'gopy',     group: 'nhansu',  name: 'Góp ý NLĐ',                 scope: 'noibo', icon: 'fa-comments',             color: '#C026D3', url: '' }
];

function doGet(e) {
  TXTV.config.appName = 'NMTXTV Digital Workspace';
  var page = (e && e.parameter && e.parameter.page) || 'Index';
  if (!PAGES[page]) return TXTV.errorPage(404);
  return TXTV.render(page, { PARAMS: (e && e.parameter) || {} }, PAGES[page]);
}

/** Dữ liệu khối App, chèn thẳng vào trang khi render (không cần gọi server lần nữa) */
function wsData() {
  return JSON.stringify({ groups: APP_GROUPS, apps: APPS }).replace(/</g, '\\u003c');
}
