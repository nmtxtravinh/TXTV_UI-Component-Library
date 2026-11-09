# TXUI – UI Component Library cho Google Apps Script

Bộ giao diện dùng chung cho các **Web App nội bộ** của **Nhà máy Túi xách Trà Vinh** (Chi nhánh 7 – Công ty Cổ phần Đầu tư Thái Bình / TBS Group).

- **Tailwind CSS v3** (Play CDN), có cấu hình màu thương hiệu TBS
- **Font Inter** (Google Fonts)
- **Icon Font Awesome 6 Free** (không tự vẽ icon)
- Thư viện JavaScript `TXUI` **không phụ thuộc thư viện ngoài** (riêng biểu đồ tự tải Chart.js khi dùng)
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
├── TXUI_Server.gs       # include(), TXUI.render(), TXUI.getUser(), TXDB (CRUD Sheet), upload Drive, cache
├── TXUI_Head.html       # Font Inter, Font Awesome, Tailwind + cấu hình màu  ➜ đặt trong <head>
├── TXUI_Styles.html     # Toàn bộ class component (được Head tự include)
├── TXUI_Scripts.html    # Thư viện JS TXUI.*                                 ➜ đặt cuối <body>
├── Index.html           # Trang tài liệu + demo mọi component (có nút "Code" để copy)
├── Starter.html         # Khung trang trống (sidebar + topbar) để bắt đầu dự án mới
└── Login.html           # Mẫu trang đăng nhập
tools/build_preview.py   # Tạo bản xem trước chạy ngoài Apps Script
```

## 2. Cài đặt vào một dự án Apps Script

**Cách 1 – Thủ công (copy/paste trong trình soạn thảo Apps Script)**

1. Tạo các file cùng tên trong project: `TXUI_Head` (HTML), `TXUI_Styles` (HTML), `TXUI_Scripts` (HTML), `TXUI_Server` (Script).
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
  <?!= include('TXUI_Head'); ?>
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

  <?!= include('TXUI_Scripts'); ?>
  <script>
    document.getElementById('btnSave').onclick = function () {
      TXUI.call('saveData', [{ a: 1 }], { button: this, success: 'Đã lưu!' });
    };
  </script>
</body>
</html>
```

```js
// Code.gs
function doGet(e) {
  TXUI.config.appName = 'Quản lý kho';
  return TXUI.render('Index', { /* biến cho template */ }, 'Trang chủ');
}
function saveData(obj) {
  return TXDB.insert('DuLieu', obj);
}
```

`TXUI.render()` tự truyền sẵn các biến `USER` (`email`, `name`, `initials`), `BASE_URL`, `APP` vào template.

> ⚠️ **Lưu ý Apps Script:**
> - Không viết thẻ scriptlet (`<? ... ?>`) bên trong comment HTML – HtmlService vẫn thực thi chúng.
> - `TXUI_Head` có `<base target="_top">`, nên **không dùng link `href="#id"`** để cuộn trong trang (sẽ tải lại cả trang). Dùng JS `element.scrollIntoView()` (xem cách làm trong `Index.html`).
> - Link chuyển trang: `<a href="<?= BASE_URL ?>?page=Starter" target="_top">`.

## 4. Danh sách component (CSS class)

| Nhóm | Class |
|---|---|
| **Button** | `btn` + `btn-primary` `btn-accent` `btn-secondary` `btn-success` `btn-warning` `btn-danger` `btn-info` `btn-dark` `btn-outline(-danger/-warning/-success)` `btn-soft(-danger/-warning/-success/-info)` `btn-ghost` `btn-link` · kích thước `btn-xs/sm/lg/xl` · `btn-icon` `btn-block` `btn-pill` · `btn-group` · `fab` |
| **Badge / Chip** | `badge` + `badge-gray/brand/accent/success/warning/danger/info/purple/solid` `badge-pill` `badge-lg` · `chip` `chip-brand` `chip-remove` · `dot dot-success/warning/danger/info/brand dot-pulse` |
| **Alert** | `alert alert-info/success/warning/danger/brand` `alert-title` `alert-close` · `callout` |
| **Card** | `card` `card-header` `card-title` `card-subtitle` `card-body` `card-footer` `card-hover` `card-brand` |
| **Thống kê** | `stat` `stat-icon` `stat-label` `stat-value` `stat-meta` `trend-up` `trend-down` |
| **Form** | `form-group` `form-label` (`required`) `form-control` (`-sm` `-lg`, `is-invalid` `is-valid`) `form-help` `form-error` · `input-icon` (`input-icon-right`, `input-action`) · `input-group` `input-group-text` · `form-check` `form-check-input` `form-switch` (`-lg`) `form-range` `form-file` · `option-card` · `dropzone` · `tag-input` · `number-input` · combobox `select[data-ui-combo]` · `form-section` |
| **Bảng** | `table-wrapper` `table` + `table-hover` `table-striped` `table-compact` `table-bordered` `table-sticky` · `TXUI.DataTable` |
| **Bố cục** | `app` `app-sidebar` `app-main` `app-topbar` `app-content` `app-footer` `app-backdrop` · `sidebar-brand` `sidebar-nav` `nav-section-title` `nav-link` `nav-label` `nav-badge` · `navbar` `navbar-link` · `page-header` `page-title` `page-subtitle` · `auth-wrap` `auth-card` |
| **Điều hướng** | `breadcrumb` · `tabs` `tab` `tabs-pills` `tab-panel` · `pagination` `page-link` · `steps` `step` `step-index` `step-label` · `dropdown` `dropdown-menu` (`dropdown-left` `dropdown-up`) `dropdown-item` (`danger`) `dropdown-divider` `dropdown-header` |
| **Overlay** | `modal` `modal-backdrop` `modal-dialog` `modal-header` `modal-title` `modal-body` `modal-footer` `modal-close` (`modal-sm/lg/xl/full`) · `drawer` `drawer-panel` `drawer-left` `drawer-lg` · tooltip `data-tooltip="..."` `data-tooltip-pos` |
| **Phản hồi** | toast · `loading-overlay` · `spinner` (`-sm/-lg/-xl`) · `progress` `progress-bar` (`accent/success/warning/danger/info`) `progress-striped` `progress-indeterminate` · progress ring · `skeleton` · `empty-state` |
| **Hiển thị** | `avatar` (`-xs/-sm/-lg/-xl`, `avatar-square`, `avatar-online/offline/busy`) `avatar-group` · `list-group` `list-item` `list-item-action` · `timeline` `timeline-item` `timeline-dot` · `accordion` `accordion-item` `accordion-trigger` `accordion-content` · `desc-list` · `divider` · `kbd` `code` · `rating` |
| **Tiện ích** | `heading-1..4` `text-muted` `link` · `no-print` `print-only` · `scrollbar-none` |

## 5. Thuộc tính `data-ui-*` (không cần viết JS)

| Thuộc tính | Tác dụng |
|---|---|
| `data-ui-toggle="modal" data-ui-target="#id"` | Mở modal |
| `data-ui-toggle="drawer" data-ui-target="#id"` | Mở drawer |
| `data-ui-dismiss="modal\|drawer\|alert"` | Đóng modal / drawer / alert |
| `data-static="true"` (trên `.modal`) | Không đóng khi bấm nền / Esc |
| `data-ui-toggle="dropdown"` | Bật/tắt dropdown |
| `data-ui-toggle="sidebar"` | Thu gọn sidebar (desktop) / mở menu (mobile) |
| `data-ui-toggle="theme"` | Đổi Sáng / Tối (icon: `<i data-ui-theme-icon>`) |
| `data-ui-toggle="password"` | Hiện/ẩn mật khẩu |
| `data-ui-toggle="collapse" data-ui-target="#id"` | Ẩn/hiện phần tử |
| `data-ui-tabs` + `data-tab` / `data-tab-panel` | Tabs |
| `data-ui-accordion="single"` | Accordion chỉ mở 1 mục |
| `select data-ui-combo` | Select có tìm kiếm không dấu |
| `data-ui-tags data-name="..."` | Nhập tag |
| `data-ui-number` | Nút +/- cho ô số |
| `data-ui-dropzone data-multiple data-max-size="10" data-list="#id"` | Kéo thả file |
| `data-ui-progress-ring data-value="72"` | Vòng tiến độ |
| `data-ui-format="currency" data-value="15000000"` | Định dạng số / tiền / ngày |
| `data-ui-copy="#id"` | Sao chép nội dung |

Khi chèn HTML động có các thành phần trên, gọi `TXUI.init(container)`.

## 6. JavaScript API

```js
// Gọi server (google.script.run dạng Promise)
const rows = await TXUI.run('getData', thamSo);
TXUI.call('saveData', [obj], { loading: 'Đang lưu...', success: 'Đã lưu!', button: btnEl });

// Thông báo
TXUI.toast('Nội dung', { type: 'success|error|warning|info', title, duration, position: 'top|bottom' });
TXUI.toast.success('Đã lưu', 'Thành công');

// Hộp thoại (Promise)
await TXUI.alert({ title: 'Xong', text: '...', type: 'success' });
if (await TXUI.confirm({ title: 'Xóa?', text: '...', type: 'danger', confirmText: 'Xóa' })) { ... }
const reason = await TXUI.prompt({ title: 'Lý do', required: true, multiline: true }); // null nếu hủy

// Modal / Drawer / Loading
TXUI.modal.open('#id'); TXUI.modal.close('#id');
TXUI.modal.create({ title, body, footer, size: 'sm|lg|xl|full' });
TXUI.drawer.open('#id');
TXUI.loading.show('Đang tải...'); TXUI.loading.hide();
TXUI.loading.block('#vung', true);
TXUI.btnLoading(btn, true, 'Đang lưu...');

// Form
if (!TXUI.form.validate('#frm')) return;     // required, pattern, min/max, email, data-match...
const data = TXUI.form.serialize('#frm');     // { name: value }, checkbox nhiều -> mảng
TXUI.form.fill('#frm', obj); TXUI.form.reset('#frm');
const file = await TXUI.fileToBase64(input.files[0]);   // gửi lên server: TXUI.uploadFile(file, folderId)

// DataTable
const dt = new TXUI.DataTable('#tbl', {
  columns: [
    { key: 'id', label: 'Mã', width: '100px' },
    { key: 'name', label: 'Tên', render: (v, row) => `<b>${TXUI.escape(v)}</b>` },
    { key: 'amount', label: 'Thành tiền', align: 'right', format: 'currency' },
    { key: 'date', label: 'Ngày', format: 'date' }
  ],
  pageSize: 10, selectable: true, exportable: true, rowKey: 'id',
  onRowClick: (row) => {}, onSelect: (rows) => {}
});
dt.setLoading(true); dt.setData(rows); dt.getSelected(); dt.updateRow(id, patch); dt.removeRow(id); dt.exportCSV();

// Biểu đồ (Chart.js tự tải, màu thương hiệu)
TXUI.chart('#canvas', { type: 'bar', data: { labels, datasets: [{ label, data }] } });

// Định dạng kiểu Việt Nam
TXUI.format.number(1234567.8)   // 1.234.567,8
TXUI.format.currency(15500000)  // 15.500.000 ₫
TXUI.format.date(new Date(), 'dd/MM/yyyy HH:mm')
TXUI.format.relative(date)      // "5 giờ trước"
TXUI.removeAccents('Trà Vinh'); TXUI.matchText('Nguyễn Văn An', 'nguyen an');
TXUI.copy(text); TXUI.download(content, 'file.csv'); TXUI.downloadBase64(b64, 'bao-cao.pdf', 'application/pdf');
```

## 7. Server: `TXDB` – dùng Google Sheet như bảng dữ liệu

Dòng 1 của sheet là tiêu đề cột. Nếu có các cột `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy` thì được điền tự động.

```js
TXDB.SPREADSHEET_ID = '...';                      // bỏ trống nếu script gắn với Sheet
TXDB.ensureSheet('NhanVien', ['id', 'ten', 'boPhan', 'createdAt', 'createdBy']);
TXDB.getAll('NhanVien');                          // [{ id, ten, ... }]
TXDB.find('NhanVien', r => r.boPhan === 'May');
TXDB.findById('NhanVien', 'NV2611091A2B');
TXDB.insert('NhanVien', { ten: 'A', boPhan: 'May' }, { prefix: 'NV' });
TXDB.update('NhanVien', id, { boPhan: 'Cắt' });
TXDB.remove('NhanVien', id);
TXUI.toClient(obj);                               // chuyển Date -> chuỗi trước khi trả về client
TXUI.cache('key', () => TXDB.getAll('NhanVien'), 600);
```

Các thao tác ghi dùng `LockService` để tránh ghi đè khi nhiều người dùng cùng lúc.

## 8. Xem trước ngoài Apps Script

```bash
python3 tools/build_preview.py
```

Mở `preview/Index.html` bằng trình duyệt (cần Internet để tải Tailwind / Font / Icon). Các lời gọi server dùng dữ liệu giả trong `TXUI.mocks`.

## 9. Ghi chú

- Tailwind **Play CDN** biên dịch CSS ngay trên trình duyệt – phù hợp với Apps Script (không có bước build). Có thể dùng mọi class tiện ích của Tailwind kết hợp với class component của TXUI.
- Muốn đổi màu thương hiệu: sửa `tailwind.config` trong `TXUI_Head.html` và `TXUI.palette` (màu biểu đồ) trong `TXUI_Scripts.html`.
- Logo: thay khối `.sidebar-logo` bằng `<img src="https://...">` (link ảnh công khai trên Drive / website công ty).
