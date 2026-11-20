# NMTXTV Digital Workspace

Cổng truy cập các ứng dụng nội bộ của Nhà máy Túi xách Trà Vinh, xây trên thư viện TXTV.

| File | Vai trò |
|---|---|
| `Code.gs` | `doGet()`, logo (`LOGO_URL`), danh mục app (`APP_GROUPS`, `APPS`) |
| `Index.html` | Giao diện workspace |
| `appsscript.json` | Manifest |
| `build.py` | Xem trước / đóng gói |
| `AGENTS.md` | Quy tắc thiết kế cho AI agent |

## Cập nhật link app

Mở `Code.gs`, điền `url` cho app tương ứng:

```js
{ id: 'luong', group: 'nhansu', name: 'Phiếu lương', scope: 'noibo', icon: 'fa-money-check-dollar', color: '#4F46E5', url: 'https://script.google.com/a/macros/.../exec' },
```

App chưa có `url` vẫn hiển thị nhưng không bấm được. App có `url` mở trong tab mới.

Đổi logo: sửa `LOGO_URL` trong `Code.gs` (link ảnh vuông, công khai).

## Xem trước

```bash
python3 apps/NMTXTV-Workspace/build.py
```

Mở `apps/NMTXTV-Workspace/preview/Index.html` bằng trình duyệt.

## Triển khai

```bash
python3 apps/NMTXTV-Workspace/build.py --dist
```

Thư mục `dist/` có đủ 8 file (gồm `TXTV_*` và `Error.html` lấy từ `src/`). Chọn một trong hai cách:

- **Thủ công:** tạo project Apps Script mới, tạo file cùng tên và dán nội dung từ `dist/`.
- **clasp:** chép `.clasp.json.example` thành `.clasp.json`, điền `scriptId`, rồi chạy `clasp push` trong thư mục này.

Sau đó: Deploy → New deployment → Web app → Execute as: *Me*, Who has access: *Anyone within TBS Group*.

Không cần Sheet hay quyền thêm ở giai đoạn này.
