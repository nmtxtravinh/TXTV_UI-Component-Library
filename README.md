# TXTV – UI Component Library cho Google Apps Script (v1.1)

Bộ giao diện dùng chung cho các **Web App nội bộ** của **Nhà máy Túi xách Trà Vinh** (Chi nhánh 7 – Công ty Cổ phần Đầu tư Thái Bình / TBS Group).

- **Tailwind CSS v3** (Play CDN), có cấu hình màu thương hiệu TBS
- **Font Inter** (Google Fonts)
- **Icon Font Awesome 6 Free** (không tự vẽ icon)
- Thư viện JavaScript `TXTV` (gọi tắt `TV`) **không phụ thuộc thư viện ngoài**; Chart.js, SheetJS (Excel), QR, mã vạch, quét camera **chỉ tự tải khi dùng**
- Quy ước tên: namespace JS `TXTV` / `TV`, thuộc tính HTML `data-tv-*`, sự kiện `tv:*`, file `TXTV_*`, server `TXTV` + `TVDB`
- Hỗ trợ **Dark mode**, **responsive** (điện thoại → màn hình lớn), **in ấn**

| Màu | Mã | Class Tailwind |
|---|---|---|
| Xanh đậm logo (brand) | `#00402A` | `brand-900` (thang `brand-50` … `brand-950`) |
| Xanh lá mạ (accent) | `#A6CE39` | `accent-400` (thang `accent-50` … `accent-950`) |
| Màu nút chính | `#0B5A41` | `brand-700` |

---

## 1. Cấu trúc thư mục

```
src/
├── appsscript.json      # Manifest (múi giờ Asia/Ho_Chi_Minh, V8, Web App)
├── Code.gs              # doGet() + hàm demo (có thể xóa khi dùng thật)
├── TXTV_Server.gs       # include(), TXTV.render(), TXTV.getUser(), TVDB (CRUD Sheet), upload Drive, cache
├── TXTV_Head.html       # Font Inter, Font Awesome, Tailwind + cấu hình màu  ➜ đặt trong <head>
├── TXTV_Styles.html     # Toàn bộ class component (được Head tự include)
├── TXTV_Scripts.html    # Thư viện JS TXTV.*                                 ➜ đặt cuối <body>
├── Index.html           # Trang tài liệu + demo mọi component (có nút "Code" để copy)
├── Starter.html         # Khung trang trống (sidebar + topbar) để bắt đầu dự án mới
├── Login.html           # Mẫu trang đăng nhập
└── Crud.html            # Mẫu quản lý danh mục hoàn chỉnh: thêm/sửa/xóa, lọc, nhập & xuất Excel, phím tắt (lưu Google Sheet)
tools/build_preview.py   # Tạo bản xem trước chạy ngoài Apps Script
```

## 2. Cài đặt vào một dự án Apps Script

**Cách 1 – Thủ công (copy/paste trong trình soạn thảo Apps Script)**

1. Tạo các file cùng tên trong project: `TXTV_Head` (HTML), `TXTV_Styles` (HTML), `TXTV_Scripts` (HTML), `TXTV_Server` (Script).
2. Dán nội dung từ thư mục `src/`.
3. (Tuỳ chọn) Thêm `Index`, `Starter`, `Login`, `Code` để có trang tài liệu.

**Cách 2 – Dùng [clasp](https://github.com/google/clasp)**

```bash
npm i -g @google/clasp
```

```bash
clasp login
```

```bash
cp .clasp.json.example .clasp.json   # rồi sửa scriptId
```

```bash
clasp push
```

**Triển khai:** Deploy ➜ New deployment ➜ Web app ➜ *Execute as: Me*, *Who has access: Anyone within TBS Group* (hoặc theo nhu cầu).

## 3. Dùng trong trang HTML

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <?!= include('TXTV_Head'); ?>
</head>
<body>
  <div class="app-content">
    <div class="card">
      <div class="card-header"><h3 class="card-title">Xin chào <?= USER.name ?></h3></div>
      <div class="card-body">
        <button class="btn btn-primary" id="btnSave"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>
      </div>
    </div>
  </div>

  <?!= include('TXTV_Scripts'); ?>
  <script>
    document.getElementById('btnSave').onclick = function () {
      TXTV.call('saveData', [{ a: 1 }], { button: this, success: 'Đã lưu!' });
    };
  </script>
</body>
</html>
```

```js
// Code.gs
function doGet(e) {
  TXTV.config.appName = 'Quản lý kho';
  return TXTV.render('Index', { /* biến cho template */ }, 'Trang chủ');
}
function saveData(obj) {
  return TVDB.insert('DuLieu', obj);
}
```

`TXTV.render()` tự truyền sẵn các biến `USER` (`email`, `name`, `initials`), `BASE_URL`, `APP` vào template.

> ⚠️ **Lưu ý Apps Script:**
> - Không viết thẻ scriptlet (`<? ... ?>`) bên trong comment HTML – HtmlService vẫn thực thi chúng.
> - `TXTV_Head` có `<base target="_top">`, nên **không dùng link `href="#id"`** để cuộn trong trang (sẽ tải lại cả trang). Dùng JS `element.scrollIntoView()` (xem cách làm trong `Index.html`).
> - Link chuyển trang: `<a href="<?= BASE_URL ?>?page=Starter" target="_top">`.

## 4. Danh sách component (CSS class)

| Nhóm | Class |
|---|---|
| **Button** | `btn` + `btn-primary` `btn-accent` `btn-secondary` `btn-success` `btn-warning` `btn-danger` `btn-info` `btn-dark` `btn-outline(-danger/-warning/-success)` `btn-soft(-danger/-warning/-success/-info)` `btn-ghost` `btn-link` · kích thước `btn-xs/sm/lg/xl` · `btn-icon` `btn-block` `btn-pill` · `btn-group` · `fab` |
| **Badge / Chip** | `badge` + `badge-gray/brand/accent/success/warning/danger/info/purple/solid` `badge-pill` `badge-lg` · `chip` `chip-brand` `chip-remove` · `dot dot-success/warning/danger/info/brand dot-pulse` |
| **Alert** | `alert alert-info/success/warning/danger/brand` `alert-title` `alert-close` · `callout` |
| **Card** | `card` `card-header` `card-title` `card-subtitle` `card-body` `card-footer` `card-hover` `card-brand` |
| **Thống kê** | `stat` `stat-icon` `stat-label` `stat-value` `stat-meta` `trend-up` `trend-down` |
| **Form** | `form-group` `form-label` (`required`) `form-control` (`-sm` `-lg`, `is-invalid` `is-valid`) `form-help` `form-error` · `input-icon` (`input-icon-right`, `input-action`) · `input-group` `input-group-text` · `form-check` `form-check-input` `form-switch` (`-lg`) `form-range` `form-file` · `option-card` · `dropzone` · `tag-input` · `number-input` · combobox `select[data-tv-combo]` · `form-section` |
| **Bảng** | `table-wrapper` `table` + `table-hover` `table-striped` `table-compact` `table-bordered` `table-sticky` · `TXTV.DataTable` |
| **Bố cục** | `app` `app-sidebar` `app-main` `app-topbar` `app-content` `app-footer` `app-backdrop` · `sidebar-brand` `sidebar-nav` `nav-section-title` `nav-link` `nav-label` `nav-badge` · `navbar` `navbar-link` · `page-header` `page-title` `page-subtitle` · `auth-wrap` `auth-card` |
| **Điều hướng** | `breadcrumb` · `tabs` `tab` `tabs-pills` `tab-panel` · `pagination` `page-link` · `steps` `step` `step-index` `step-label` · `dropdown` `dropdown-menu` (`dropdown-left` `dropdown-up`) `dropdown-item` (`danger`) `dropdown-divider` `dropdown-header` |
| **Overlay** | `modal` `modal-backdrop` `modal-dialog` `modal-header` `modal-title` `modal-body` `modal-footer` `modal-close` (`modal-sm/lg/xl/full`) · `drawer` `drawer-panel` `drawer-left` `drawer-lg` · tooltip `data-tooltip="..."` `data-tooltip-pos` |
| **Phản hồi** | toast · `loading-overlay` · `spinner` (`-sm/-lg/-xl`) · `progress` `progress-bar` (`accent/success/warning/danger/info`) `progress-striped` `progress-indeterminate` · progress ring · `skeleton` · `empty-state` |
| **Hiển thị** | `avatar` (`-xs/-sm/-lg/-xl`, `avatar-square`, `avatar-online/offline/busy`) `avatar-group` · `list-group` `list-item` `list-item-action` · `timeline` `timeline-item` `timeline-dot` · `accordion` `accordion-item` `accordion-trigger` `accordion-content` · `desc-list` · `divider` · `kbd` `code` · `rating` |
| **Mở rộng v1.1** | `segmented` · `otp` · `rating-input` · `signature-pad` · `lightbox` `thumb` · `kanban` `kanban-col` `kanban-head` `kanban-count` `kanban-list` `kanban-card` · `sortable-item` `drag-handle` · `tree` · `calendar` · `popover` `popover-title` · `banner` (`banner-warning` `banner-danger`) · `countdown` · `back-to-top` · `sparkline` · `context-menu` · `scanner-view` |
| **Tiện ích** | `heading-1..4` `text-muted` `link` · `no-print` `print-only` · `scrollbar-none` |

## 5. Thuộc tính `data-tv-*` (không cần viết JS)

| Thuộc tính | Tác dụng |
|---|---|
| `data-tv-toggle="modal" data-tv-target="#id"` | Mở modal |
| `data-tv-toggle="drawer" data-tv-target="#id"` | Mở drawer |
| `data-tv-dismiss="modal\|drawer\|alert"` | Đóng modal / drawer / alert |
| `data-static="true"` (trên `.modal`) | Không đóng khi bấm nền / Esc |
| `data-tv-toggle="dropdown"` | Bật/tắt dropdown |
| `data-tv-toggle="sidebar"` | Thu gọn sidebar (desktop) / mở menu (mobile) |
| `data-tv-toggle="theme"` | Đổi Sáng / Tối (icon: `<i data-tv-theme-icon>`) |
| `data-tv-toggle="password"` | Hiện/ẩn mật khẩu |
| `data-tv-toggle="collapse" data-tv-target="#id"` | Ẩn/hiện phần tử |
| `data-tv-tabs` + `data-tab` / `data-tab-panel` | Tabs |
| `data-tv-accordion="single"` | Accordion chỉ mở 1 mục |
| `select data-tv-combo` | Select có tìm kiếm không dấu |
| `data-tv-tags data-name="..."` | Nhập tag |
| `data-tv-number` | Nút +/- cho ô số |
| `data-tv-dropzone data-multiple data-max-size="10" data-list="#id"` | Kéo thả file |
| `data-tv-progress-ring data-value="72"` | Vòng tiến độ |
| `data-tv-format="currency" data-value="15000000"` | Định dạng số / tiền / ngày |
| `data-tv-copy="#id"` | Sao chép nội dung |
| `data-tv-dismiss="banner"` | Đóng banner |
| `data-tv-mask="number" data-decimals="2"` | Ô số tự thêm dấu chấm hàng nghìn (`serialize()` trả về Number) |
| `data-tv-otp data-length="6" data-name="otp"` | Ô nhập OTP / PIN (sự kiện `tv:complete`) |
| `data-tv-rating data-name="diem" data-value="3"` | Chấm sao |
| `canvas data-tv-signature` | Ô ký tên (đặt trong `.signature-pad`) |
| `data-tv-sortable="nhom"` | Kéo thả sắp xếp; cùng tên nhóm = kéo qua lại (Kanban). Sự kiện `tv:sort` |
| `data-tv-lightbox="nhom" data-caption="..."` | Bấm ảnh để xem lớn |
| `data-tv-clock data-format="HH:mm:ss"` | Đồng hồ chạy |
| `data-tv-countdown="2026-12-31T17:00"` | Đếm ngược (sự kiện `tv:done`) |
| `data-tv-sparkline="5,8,6,12"` | Biểu đồ mini |
| `data-tv-backtop` | Nút lên đầu trang |

Khi chèn HTML động có các thành phần trên, gọi `TXTV.init(container)`.

## 6. JavaScript API

```js
// Gọi server (google.script.run dạng Promise)
const rows = await TXTV.run('getData', thamSo);
TXTV.call('saveData', [obj], { loading: 'Đang lưu...', success: 'Đã lưu!', button: btnEl });

// Thông báo
TXTV.toast('Nội dung', { type: 'success|error|warning|info', title, duration, position: 'top|bottom' });
TXTV.toast.success('Đã lưu', 'Thành công');

// Hộp thoại (Promise)
await TXTV.alert({ title: 'Xong', text: '...', type: 'success' });
if (await TXTV.confirm({ title: 'Xóa?', text: '...', type: 'danger', confirmText: 'Xóa' })) { ... }
const reason = await TXTV.prompt({ title: 'Lý do', required: true, multiline: true }); // null nếu hủy

// Modal / Drawer / Loading
TXTV.modal.open('#id'); TXTV.modal.close('#id');
TXTV.modal.create({ title, body, footer, size: 'sm|lg|xl|full' });
TXTV.drawer.open('#id');
TXTV.loading.show('Đang tải...'); TXTV.loading.hide();
TXTV.loading.block('#vung', true);
TXTV.btnLoading(btn, true, 'Đang lưu...');

// Form
if (!TXTV.form.validate('#frm')) return;     // required, pattern, min/max, email, data-match...
const data = TXTV.form.serialize('#frm');     // { name: value }, checkbox nhiều -> mảng
TXTV.form.fill('#frm', obj); TXTV.form.reset('#frm');
const file = await TXTV.fileToBase64(input.files[0]);   // gửi lên server: TXTV.uploadFile(file, folderId)

// DataTable
const dt = new TXTV.DataTable('#tbl', {
  columns: [
    { key: 'id', label: 'Mã', width: '100px' },
    { key: 'name', label: 'Tên', render: (v, row) => `<b>${TXTV.escape(v)}</b>` },
    { key: 'amount', label: 'Thành tiền', align: 'right', format: 'currency' },
    { key: 'date', label: 'Ngày', format: 'date' }
  ],
  pageSize: 10, selectable: true, exportable: true, rowKey: 'id',
  onRowClick: (row) => {}, onSelect: (rows) => {}
});
dt.setLoading(true); dt.setData(rows); dt.getSelected(); dt.updateRow(id, patch); dt.removeRow(id); dt.exportCSV();

// Biểu đồ (Chart.js tự tải, màu thương hiệu)
TXTV.chart('#canvas', { type: 'bar', data: { labels, datasets: [{ label, data }] } });

// Định dạng kiểu Việt Nam
TXTV.format.number(1234567.8)   // 1.234.567,8
TXTV.format.currency(15500000)  // 15.500.000 ₫
TXTV.format.date(new Date(), 'dd/MM/yyyy HH:mm')
TXTV.format.relative(date)      // "5 giờ trước"
TXTV.removeAccents('Trà Vinh'); TXTV.matchText('Nguyễn Văn An', 'nguyen an');
TXTV.copy(text); TXTV.download(content, 'file.csv'); TXTV.downloadBase64(b64, 'bao-cao.pdf', 'application/pdf');
```

### Mở rộng v1.1

```js
// Excel (SheetJS tự tải)
TXTV.exportExcel(rows, [{ key: 'maVT', label: 'Mã VT' }, { key: 'ngay', label: 'Ngày', format: 'date' }], 'bao-cao');
const rows = await TXTV.readExcel(file);        // dòng 1 là tiêu đề
dt.exportExcel();                               // DataTable: nút "Xuất file" có Excel + CSV

// QR / mã vạch / quét mã
TXTV.qrcode('#qr', 'PO-2611|TX-021|500', { size: 160 });
TXTV.barcode('#svg', 'TX021-0001', { format: 'CODE128' });
const code = await TXTV.scan({ title: 'Quét mã bó hàng' });   // camera hoặc súng bắn mã USB; null nếu hủy

// Chữ ký, ảnh, in
const sig = TXTV.signature('#canvas'); sig.isEmpty(); sig.toBase64();   // -> TXTV.uploadFile() phía server
TXTV.lightbox([{ src, caption }], 0);
TXTV.print('#phieu', { title: 'Phiếu xuất kho' });           // hoặc truyền chuỗi HTML

// Lịch, cây, kéo thả
new TXTV.Calendar('#cal', { events: [{ date: '2026-11-20', end: '2026-11-22', title: 'Kiểm kê', color: 'warning' }],
                            onDateClick: d => {}, onEventClick: ev => {} });
const tree = TXTV.tree('#tree', [{ id, label, icon, badge, open, children: [] }], { onSelect: node => {} });
tree.filter('khoa keo'); tree.expandAll();
el.addEventListener('tv:sort', e => TXTV.run('capNhatTrangThai', e.detail.id, e.detail.to.dataset.status));

// Năng suất thao tác
TXTV.commandPalette.register([{ group: 'Kho', label: 'Tạo phiếu nhập', icon: 'fa-plus', action: fn }]);  // Ctrl+K
TXTV.hotkey('ctrl+s', fn, { inInputs: true });  TXTV.hotkey('alt+n', fn);
TXTV.contextMenu('#bang', (e, row) => [{ label: 'Sửa', icon: 'fa-pen', action: fn }, { divider: true }], 'tr');
TXTV.form.autosave('#frm', 'phieu-nhap');       // tự lưu nháp vào trình duyệt
const guard = TXTV.form.guard('#frm');          // cảnh báo khi rời trang chưa lưu
const stop = TXTV.poll(() => load(), 60000);    // tự làm mới, tạm dừng khi ẩn tab
TXTV.url.params().then(p => p.id);  TXTV.url.set({ tab: 'kho' });   // URL trong Apps Script
TXTV.sparkline('#el', [5, 8, 6, 12]);  TXTV.mask.parse('1.250.000,5');  // 1250000.5
TXTV.groupBy(rows, 'boPhan'); TXTV.sumBy(rows, 'soLuong'); TXTV.sortBy(rows, 'ten'); TXTV.storage.set('k', obj);
```

> Kéo thả dùng HTML5 Drag & Drop (chuột). Camera cần trình duyệt cho phép; nếu bị chặn khi nhúng (Google Sites…) hãy mở trực tiếp URL Web App, hoặc dùng súng bắn mã (luôn hoạt động).

## 7. Server: `TVDB` – dùng Google Sheet như bảng dữ liệu

Dòng 1 của sheet là tiêu đề cột. Nếu có các cột `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy` thì được điền tự động.

```js
TVDB.SPREADSHEET_ID = '...';                      // bỏ trống nếu script gắn với Sheet
TVDB.ensureSheet('NhanVien', ['id', 'ten', 'boPhan', 'createdAt', 'createdBy']);
TVDB.getAll('NhanVien');                          // [{ id, ten, ... }]
TVDB.find('NhanVien', r => r.boPhan === 'May');
TVDB.findById('NhanVien', 'NV2611091A2B');
TVDB.insert('NhanVien', { ten: 'A', boPhan: 'May' }, { prefix: 'NV' });
TVDB.update('NhanVien', id, { boPhan: 'Cắt' });
TVDB.remove('NhanVien', id);
TXTV.toClient(obj);                               // chuyển Date -> chuỗi trước khi trả về client
TXTV.cache('key', () => TVDB.getAll('NhanVien'), 600);
```

Các thao tác ghi dùng `LockService` để tránh ghi đè khi nhiều người dùng cùng lúc.

**Mở rộng v1.1 (server):**

```js
TVDB.query('NhanVien', { where: { boPhan: 'May' }, search: 'nguyen', sort: 'ten', page: 1, pageSize: 20 }); // gọi thẳng từ client được
TVDB.insertMany('VatTu', rows, { prefix: 'VT' });   // nhập Excel nhanh
TVDB.upsert('VatTu', obj);  TVDB.count('VatTu', { nhom: 'Vải' });

TXTV.sendMail({ to, subject, title, html, button: { text: 'Mở phiếu', url } });   // email có khung thương hiệu TBS
const pdf = TXTV.htmlToPdf(html, 'phieu-xuat');  // client: TXTV.downloadBase64(pdf.data, pdf.name, pdf.mimeType)
TXTV.audit('DUYET_PHIEU', { id });               // nhật ký vào sheet "NhatKy"
TXTV.requireRole(['admin', 'quanly']);           // phân quyền theo sheet "PhanQuyen" (email | role)
TXTV.settings.set('ngayChotSo', 25); TXTV.settings.get('ngayChotSo', 25);
TXTV.getOptions('BoPhan', 'ma', 'ten');          // [{value,label}] cho TXTV.setOptions()
```

## 8. Xem trước ngoài Apps Script

```bash
python3 tools/build_preview.py
```

Mở `preview/Index.html` bằng trình duyệt (cần Internet để tải Tailwind / Font / Icon). Các lời gọi server dùng dữ liệu giả trong `TXTV.mocks`.

## 9. Ghi chú

- Tailwind **Play CDN** biên dịch CSS ngay trên trình duyệt – phù hợp với Apps Script (không có bước build). Có thể dùng mọi class tiện ích của Tailwind kết hợp với class component của TXTV.
- Muốn đổi màu thương hiệu: sửa `tailwind.config` trong `TXTV_Head.html` và `TXTV.palette` (màu biểu đồ) trong `TXTV_Scripts.html`.
- Logo: thay khối `.sidebar-logo` bằng `<img src="https://...">` (link ảnh công khai trên Drive / website công ty).
