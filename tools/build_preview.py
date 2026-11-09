#!/usr/bin/env python3
"""
Tạo bản xem trước (preview) chạy trực tiếp trên trình duyệt, KHÔNG cần Apps Script.
  python3 tools/build_preview.py
Kết quả: thư mục preview/ (Index.html, Starter.html, Login.html)
- Thay các thẻ include('...') bằng nội dung file tương ứng.
- Thay các biến template (USER, BASE_URL...) bằng giá trị mẫu.
- Gọi server (TXTV.run) sẽ dùng TXTV.mocks khi chạy ngoài Apps Script.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'preview')
PAGES = ['Index', 'Starter', 'Login', 'Crud', 'Dashboard', 'Mobile', 'Error']

SAMPLE = {
    'USER.initials': 'NV',
    'USER.name': 'nguyen van a',
    'USER.email': 'nguyen.van.a@tbsgroup.vn',
    'BASE_URL': 'Index.html',
    'CODE': '404',
    'TITLE': 'Không tìm thấy trang',
    'MESSAGE': 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.',
}

INCLUDE_RE = re.compile(r"<\?!=\s*include\(\s*['\"]([\w-]+)['\"]\s*\);?\s*\?>")
PRINT_RE = re.compile(r"<\?=\s*([\w.]+)\s*;?\s*\?>")


def render(name, depth=0):
    if depth > 10:
        sys.exit('include lồng quá sâu: ' + name)
    with open(os.path.join(SRC, name + '.html'), encoding='utf-8') as f:
        html = f.read()
    html = INCLUDE_RE.sub(lambda m: render(m.group(1), depth + 1), html)
    html = PRINT_RE.sub(lambda m: SAMPLE.get(m.group(1), ''), html)
    return html


def main():
    os.makedirs(OUT, exist_ok=True)
    for p in PAGES:
        html = render(p).replace("href=\"Index.html?page=", "href=\"")
        html = re.sub(r'href="([A-Za-z]+)"(\s+target="_top")', r'href="\1.html"\2', html)
        with open(os.path.join(OUT, p + '.html'), 'w', encoding='utf-8') as f:
            f.write(html)
        print('✔ preview/' + p + '.html')


if __name__ == '__main__':
    main()
