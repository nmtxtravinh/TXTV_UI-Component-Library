# Hướng dẫn cho AI Agent (Codex, Claude Code, Cursor, Copilot…)

> File này dành cho AI viết code. Khi bắt đầu một dự án Google Apps Script mới dùng thư viện **TXTV**,
> chép file này (kèm `CLAUDE.md`) vào thư mục gốc dự án. Agent sẽ tự đọc và làm theo.
> Demo mọi component (có nút xem code): https://nmtxtravinh.github.io/TXTV_UI-Component-Library/

## 1. Bối cảnh

- Web App **Google Apps Script** (HtmlService) nội bộ của Nhà máy Túi xách Trà Vinh – TBS Group.
- Giao diện dùng thư viện **TXTV**: Tailwind CSS v3 (Play CDN) + class component riêng, font Inter, icon **Font Awesome 6**.
- Ngôn ngữ giao diện: **tiếng Việt**. Ngày `dd/MM/yyyy`, số `1.234.567,5`, tiền `15.500.000 ₫`, múi giờ `Asia/Ho_Chi_Minh`.
- Người dùng: nhân viên văn phòng, tổ trưởng, công nhân (một số dùng tablet/điện thoại).

## 2. Cấu trúc file

| File | Vai trò | Được sửa? |
|---|---|---|
| `TXTV_Head.html`, `TXTV_Styles.html`, `TXTV_Scripts.html`, `TXTV_Server.gs` | Thư viện dùng chung | **KHÔNG sửa** – cập nhật bằng cách chép đè bản mới |
| `Code.gs` | `doGet()`, danh sách trang `PAGES`, hàm server của dự án | Có |
| `<TenTrang>.html` | Mỗi màn hình 1 file | Có |
| `appsscript.json` | Manifest (timeZone `Asia/Ho_Chi_Minh`, V8) | Khi cần quyền mới |

> Ngoại lệ: trong chính repo thư viện **TXTV_UI-Component-Library** thì được sửa `TXTV_*`. Sau khi sửa phải cập nhật demo `src/Index.html` + `README.md`
> và chạy `python3 tools/build_preview.py`; trang demo GitHub Pages tự build lại khi push.

Thiếu class/tính năng? Viết CSS/JS riêng trong file trang (thẻ `<style>`/`<script>` của trang đó), **không** chỉnh `TXTV_*`.
Có thể dùng thêm mọi class tiện ích của Tailwind (`grid`, `gap-4`, `md:grid-cols-2`, `text-slate-500`…).

## 3. Khung bắt buộc

**Trang HTML**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <?!= include('TXTV_Head'); ?>
</head>
<body>
  <!-- nội dung: dùng class TXTV, xem mục 5 -->
  <?!= include('TXTV_Scripts'); ?>
  <script>
    // code của trang
  </script>
</body>
</html>
```

**Code.gs**
```js
var PAGES = { Index: 'Trang chủ', VatTu: 'Danh mục vật tư' };   // tên file HTML: tiêu đề tab

function doGet(e) {
  TXTV.config.appName = 'Tên ứng dụng';
  var page = (e && e.parameter && e.parameter.page) || 'Index';
  if (!PAGES[page]) return TXTV.errorPage(404);
  return TXTV.render(page, { PARAMS: e.parameter || {} }, PAGES[page]);   // template có sẵn USER, BASE_URL, APP
}

// Hàm server: toàn cục, trả dữ liệu qua TXTV.toClient (để Date không làm hỏng kết quả)
function layVatTu() { return TXTV.toClient(TVDB.getAll('VatTu')); }
function luuVatTu(o) {
  if (!o || !o.maVT) throw new Error('Thiếu mã vật tư');            // lỗi -> client nhận qua catch / toast tự động
  return TXTV.toClient(o.id ? TVDB.update('VatTu', o.id, o) : TVDB.insert('VatTu', o, { prefix: 'VT' }));
}
```

## 4. Quy tắc bắt buộc

**Apps Script**
1. Gọi server **chỉ** bằng `TXTV.run('tenHam', ...)` (Promise) hoặc `TXTV.call('tenHam', [args], { button, loading, success })` – không dùng `fetch`, không gọi `google.script.run` trực tiếp.
2. Không dùng `href="#id"` (Apps Script đặt `<base target="_top">`, sẽ tải lại trang). Cuộn trong trang: `data-tv-scroll="id"`. Chuyển trang: `<a href="<?= BASE_URL ?>?page=VatTu" target="_top">`.
3. Không viết thẻ scriptlet `<? ?>` trong comment HTML (HtmlService vẫn chạy chúng).
4. Dữ liệu trên Google Sheet qua `TVDB` (dòng 1 là tiêu đề; nên có cột `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy` – được điền tự động). Script không gắn Sheet thì đặt `TVDB.SPREADSHEET_ID`.
5. Thêm mock trong trang để xem trước ngoài Apps Script: `TXTV.mocks.layVatTu = function () { return [...]; };` (không ảnh hưởng khi chạy thật).

**Giao diện**
6. Dùng component TXTV (mục 5), không tự viết CSS cho nút/ô nhập/bảng/modal, không thêm Bootstrap, jQuery, React, Vue.
7. Không dùng `alert()`, `confirm()`, `prompt()` của trình duyệt → dùng `TXTV.toast`, `TXTV.confirm`, `TXTV.prompt`.
8. Thao tác xóa: `TXTV.confirm({ title, text, type: 'danger', confirmText: 'Xóa', details: {...} })`. **Không** thêm `requireText` trừ khi được yêu cầu.
9. Toast ngắn gọn, nêu kết quả cụ thể: `TXTV.toast.success('Đã lưu phiếu PX-001')`. Không thêm tiêu đề lặp ý ("Thành công", "Thông báo").
10. Phong cách: phẳng, gọn, màu đặc. Không dùng gradient, viền màu một bên, đốm sáng mờ, emoji trang trí. Màu chính: `brand-*` (xanh TBS `#00402A`), nhấn: `accent-*` (`#A6CE39`).
11. Mọi dữ liệu người dùng chèn vào `innerHTML` phải qua `TXTV.escape(...)`. HTML từ editor: `TXTV.sanitize(...)`.
12. Responsive: phải dùng được trên điện thoại 390px, không tràn ngang. Bảng nhiều cột: `DataTable` hoặc `.table-stack`.
13. Nhãn, thông báo, placeholder bằng tiếng Việt có dấu. Không dùng icon ngoài Font Awesome 6 Free.

## 5. Chọn component theo nhu cầu

| Cần | Dùng |
|---|---|
| Khung trang có menu | `.app` > `.app-sidebar` + `.app-main` > `.app-topbar` + `.app-content` (mẫu: `Starter.html`) |
| Tiêu đề trang | `.page-header` / `.page-heading` (có meta + nút) · `.breadcrumb` |
| Nút | `.btn` + `.btn-primary / -secondary / -ghost / -danger / -soft…`, `.btn-sm`, `.btn-icon` |
| Form | `.fieldset` > `.field` (`.form-label`, `.form-control`, `.field-desc`) · `.field-horizontal` · `.form-actions` |
| Ô nhập có icon/nút | `.input-box` + `.input-addon` · `.input-icon` · `.input-group` |
| Chọn | `select.form-control` · `select[data-tv-combo]` (tìm kiếm, `multiple` để chọn nhiều) · `TXTV.autocomplete` |
| Ngày / giờ / tháng | `data-tv-datepicker` (`data-mode="range"`) · `data-tv-timepicker` · `data-tv-monthpicker` |
| Số / tiền | `data-tv-mask="number"` (serialize ra Number) · `data-tv-numpad` (tablet) |
| Checkbox / radio / switch | `.form-check-input`, `.check-item`, `.form-switch`, `.option-card`, `.segmented`, `data-tv-check-all` |
| Kiểm tra | `required`, `pattern`, `min/max`, `data-tv-validate="phone|cccd|mst|email|url"` → `TXTV.form.validate(form)` |
| Đọc / đổ / xóa form | `TXTV.form.serialize(form)` · `TXTV.form.fill(form, obj)` · `TXTV.form.reset(form)` |
| Upload | `.dropzone[data-tv-dropzone]` · `TXTV.fileToBase64` / `TXTV.compressImage` → server `TXTV.uploadFile(obj, folderId)` |
| Danh sách dữ liệu | `new TXTV.DataTable(el, { columns, filters, columnToggle, expandRow, totals, selectable, exportable })` |
| Nhập nhiều dòng kiểu Excel | `new TXTV.EditableGrid(el, { columns, data })` → `.getChanges()` |
| Thêm / sửa nhanh | `.modal` (`TXTV.modal.open('#id')`) · `.drawer` · `.modal-sheet` (điện thoại) |
| Thông báo | `TXTV.toast.*`, `TXTV.toast.promise`, `.alert`, `.banner`, `.empty-state` |
| Chờ | `TXTV.call(..., { button })` (nút xoay) · `TXTV.loading.show/hide` · `.skeleton` / `TXTV.skeleton` |
| Thống kê | `.stat` · `.kpi-big` · `TXTV.chart` (Chart.js) · `TXTV.gauge` · `TXTV.sparkline` · `TXTV.renderPivot` · `TXTV.gantt` |
| Tab / bước | `[data-tv-tabs]` + `.tabs`/`.tabs-pills`/`.tabs-vertical` · `.steps`, `.steps-panels`, `data-tv-wizard` |
| Menu | `.dropdown` · `.menubar` · `.nav-menu` · `TXTV.contextMenu` · `TXTV.commandPalette` |
| Xuất / in | `TXTV.exportExcel` · `dt.exportExcel()` · `TXTV.print(el)` · server `TXTV.htmlToPdf` / `TXTV.docFromTemplate` |
| Khác | `new TXTV.Calendar(el, { events })` · `TXTV.tree` · `.kanban` + `data-tv-sortable` · `TXTV.scan` (mã vạch/QR) · `TXTV.qrcode` · `TXTV.signature` |

Định dạng: `TXTV.format.number / currency / percent / date / datetime / relative`. Tìm không dấu: `TXTV.matchText`.

**Server** (`TXTV_Server.gs`): `TVDB.getAll / find / findById / query / insert / insertMany / update / upsert / remove / nextNumber('PX')` ·
`TXTV.getUser()` · `TXTV.requireRole(['admin'])` (sheet `PhanQuyen`) · `TXTV.audit(action, detail)` · `TXTV.sendMail` · `TXTV.chatNotify` · `TXTV.settings` · `TXTV.cache` · `TXTV.errorPage(403)`.

## 6. Mẫu chuẩn cho form lưu dữ liệu

```js
document.getElementById('frm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!TXTV.form.validate(this)) return;
  var data = TXTV.form.serialize(this);
  TXTV.call('luuVatTu', [data], { button: '#btnLuu', success: 'Đã lưu ' + data.maVT })
    .then(function (saved) { table.addRow(saved, true); TXTV.modal.close('#mdl'); })
    .catch(function () {});   // lỗi đã được hiện bằng toast
});
```

Tham khảo trang mẫu đầy đủ trước khi viết màn hình mới: `Crud.html` (danh mục), `Dashboard.html` (báo cáo), `Mobile.html` (nhập trên tablet), `Settings.html` (cài đặt), `Login.html`.

## 7. Trước khi báo xong

- [ ] Không sửa file `TXTV_*`; mọi trang có `include('TXTV_Head')` và `include('TXTV_Scripts')`.
- [ ] Mọi hàm `TXTV.run('x')` đều có hàm `x` trong `.gs` (và mock `TXTV.mocks.x` nếu cần xem trước).
- [ ] Không còn `alert(`, `confirm(`, `fetch(`, `href="#`.
- [ ] Thử ở chế độ tối (`TXTV.theme.toggle()`) và màn hình 390px.
- [ ] Nếu repo có `tools/build_preview.py`: chạy `python3 tools/build_preview.py` và mở `preview/` để xem không có lỗi console.
- [ ] Liệt kê cho người dùng: file đã thêm/sửa, sheet + cột cần tạo, quyền Apps Script cần cấp, cách triển khai.
