# NMTXTV Digital Workspace – quy tắc cho AI agent

Áp dụng **thêm** vào quy tắc thư viện TXTV (`AGENTS.md` ở gốc repo). Khi hai bên khác nhau, theo file này.

## Phạm vi
- Cổng truy cập ứng dụng nội bộ. Một trang `Index.html`, chuyển khối menu phía client (`?view=`), không tải lại trang.
- Khối menu: Trang chủ, App, Tiện ích, Tài liệu, Báo cáo, Danh bạ, Thông báo, Tin tức. Hiện chỉ **App** có nội dung.
- Không hiện nhãn trạng thái phát triển ("Sắp có", "Chưa có liên kết", "Đang xây dựng"). App chưa có `url` hiện bình thường nhưng không bấm được.
- Không khối thông tin người dùng mẫu. Tài khoản nằm ở topbar: avatar + menu (tên, email, Đăng xuất); chưa đăng nhập thì nút "Đăng nhập".
- Logo: `LOGO_URL` trong `Code.gs`.
- Danh mục app nằm ở `APP_GROUPS` / `APPS` trong `Code.gs`. Thêm link: điền `url`. Thêm app: thêm một dòng, chọn icon Font Awesome 6 Free (solid) và một màu chưa dùng.

## Màu
- Dùng đúng giao diện thư viện TXTV: sidebar xanh brand đậm, mục đang chọn màu accent. Không tự viết lại sidebar.
- Vùng nội dung trung tính (slate). Brand chỉ xuất hiện ở: tiêu đề nhóm, viền/hover thẻ app, badge "Nội bộ", nút chính.
- Ô icon app: mỗi app một màu đặc, icon trắng, không lặp màu trong cùng một nhóm.
- Phạm vi app (Nội bộ, Ngành, Chuỗi, Bộ) dùng `.badge` nền nhạt, khai báo ở biến `SCOPE` trong `Index.html`.
- Không gradient, không bóng đổ đậm, không viền màu một bên.
- Kiểm tra cả dark mode.

## Chữ
- Nhãn ngắn, đúng nghiệp vụ. Không câu giới thiệu, không phụ đề giải thích điều người dùng đã thấy.
- Không tiêu đề trang lặp lại tên mục menu nếu topbar đã có.
- Thông báo trống/lỗi: một câu nêu tình trạng, nếu có thì kèm một hành động.
- Không emoji, không chữ in hoa toàn bộ trừ nhãn nhóm nhỏ.

## Bố cục
- Mật độ vừa phải: ô app cao ~64px, rộng tối thiểu 230px, lưới tự thêm cột (auto-fill), không kéo giãn thẻ.
- Sidebar chia nhóm "Làm việc" / "Kết nối"; mục đang chọn nền trắng mờ + icon accent.
- Mỗi màn hình chỉ có thứ cần dùng: tìm kiếm + danh sách. Không thêm thống kê, banner, "chào mừng" khi chưa có yêu cầu.
- Chạy được ở 390px, không tràn ngang.

## Xem trước và triển khai
- `python3 apps/NMTXTV-Workspace/build.py` → `preview/Index.html`.
- `python3 apps/NMTXTV-Workspace/build.py --dist` → `dist/` (thư viện TXTV_* lấy từ `src/`, không chép vào thư mục này).
