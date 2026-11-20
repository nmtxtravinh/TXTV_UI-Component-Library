# NMTXTV Digital Workspace – quy tắc cho AI agent

Áp dụng **thêm** vào quy tắc thư viện TXTV (`AGENTS.md` ở gốc repo). Khi hai bên khác nhau, theo file này.

## Phạm vi
- Cổng truy cập ứng dụng nội bộ. Một trang `Index.html`, chuyển khối menu phía client (`?view=`), không tải lại trang.
- Khối menu: Trang chủ, App, Tiện ích, Tài liệu, Báo cáo, Danh bạ, Thông báo, Tin tức. Hiện chỉ **App** hoạt động; khối khác hiện "Sắp có".
- Danh mục app nằm ở `APP_GROUPS` / `APPS` trong `Code.gs`. Thêm link: điền `url`. Thêm app: thêm một dòng, chọn icon Font Awesome 6 Free (solid) và một màu chưa dùng.

## Màu
- Nền và khung trung tính (slate). **Không** tô xanh brand cho sidebar, topbar, nền, tiêu đề, thẻ.
- Xanh brand chỉ dùng ở: logo, icon của mục menu đang chọn, nút chính (`btn-primary`), viền focus.
- Màu sắc chỉ xuất hiện ở ô icon của app (mỗi app một màu đặc, icon trắng). Không lặp màu trong cùng một nhóm.
- Không gradient, không bóng đổ đậm, không viền màu một bên, không nền màu nhạt cho cả khối.
- Dark mode: kiểm tra mọi thay đổi, nền `slate-900/950`, không dùng `brand-950` làm nền.

## Chữ
- Nhãn ngắn, đúng nghiệp vụ. Không câu giới thiệu, không phụ đề giải thích điều người dùng đã thấy.
- Không tiêu đề trang lặp lại tên mục menu nếu topbar đã có.
- Thông báo trống/lỗi: một câu nêu tình trạng, nếu có thì kèm một hành động.
- Không emoji, không chữ in hoa toàn bộ trừ nhãn nhóm nhỏ.

## Bố cục
- Mật độ vừa phải: ô app cao ~68px, lưới 1/2/3/4 cột theo bề rộng.
- Mỗi màn hình chỉ có thứ cần dùng: tìm kiếm + lọc phạm vi + danh sách. Không thêm thống kê, banner, "chào mừng" khi chưa có yêu cầu.
- Chạy được ở 390px, không tràn ngang.

## Xem trước và triển khai
- `python3 apps/NMTXTV-Workspace/build.py` → `preview/Index.html`.
- `python3 apps/NMTXTV-Workspace/build.py --dist` → `dist/` (thư viện TXTV_* lấy từ `src/`, không chép vào thư mục này).
