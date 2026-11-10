#!/usr/bin/env python3
"""
Tạo bản xem trước (preview) chạy trực tiếp trên trình duyệt, KHÔNG cần Apps Script.

  python3 tools/build_preview.py              -> thư mục preview/  (Index.html, Crud.html, ...)
  python3 tools/build_preview.py --site _site -> site tĩnh cho GitHub Pages (index.html, 404.html, .nojekyll)

- Thay các thẻ include('...') bằng nội dung file tương ứng.
- Thay các biến template (USER, BASE_URL...) bằng giá trị mẫu.
- Link "?page=Ten" được đổi thành "Ten.html"; trang không tồn tại trỏ về trang lỗi.
- Gọi server (TXTV.run) sẽ dùng TXTV.mocks khi chạy ngoài Apps Script.
"""
import argparse, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
PAGES = ['Index', 'Starter', 'Login', 'Crud', 'Dashboard', 'Mobile', 'Settings', 'Error']

SAMPLE = {
    'USER.initials': 'NV',
    'USER.name': 'nguyen van a',
    'USER.email': 'nguyen.van.a@tbsgroup.vn',
    'CODE': '404',
    'TITLE': 'Không tìm thấy trang',
    'MESSAGE': 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi.',
}

INCLUDE_RE = re.compile(r"<\?!=\s*include\(\s*['\"]([\w-]+)['\"]\s*\);?\s*\?>")
PRINT_RE = re.compile(r"<\?=\s*([\w.]+)\s*;?\s*\?>")
BASE = '__TXTV_BASE__'


def render(name, depth=0):
    if depth > 10:
        sys.exit('include lồng quá sâu: ' + name)
    with open(os.path.join(SRC, name + '.html'), encoding='utf-8') as f:
        html = f.read()
    html = INCLUDE_RE.sub(lambda m: render(m.group(1), depth + 1), html)
    html = PRINT_RE.sub(lambda m: BASE if m.group(1) == 'BASE_URL' else SAMPLE.get(m.group(1), ''), html)
    return html


def file_of(page, site):
    if page == 'Index':
        return 'index.html' if site else 'Index.html'
    return page + '.html' if page in PAGES else 'Error.html'


def build(out, site):
    os.makedirs(out, exist_ok=True)
    for p in PAGES:
        html = render(p)
        # BASE_URL?page=Ten  ->  Ten.html   |   BASE_URL  ->  trang chủ
        html = re.sub(BASE + r'\?page=([A-Za-z]+)', lambda m: file_of(m.group(1), site), html)
        html = html.replace(BASE, file_of('Index', site))
        name = file_of(p, site)
        with open(os.path.join(out, name), 'w', encoding='utf-8') as f:
            f.write(html)
        print('✔ ' + os.path.relpath(os.path.join(out, name), ROOT))
        if site and p == 'Error':
            # GitHub Pages dùng 404.html cho mọi đường dẫn không tồn tại (link tuyệt đối theo thư mục gốc site)
            with open(os.path.join(out, '404.html'), 'w', encoding='utf-8') as f:
                f.write(html)
    if site:
        open(os.path.join(out, '.nojekyll'), 'w').close()
        print('✔ 404.html, .nojekyll')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--site', metavar='DIR', help='xuất site tĩnh cho GitHub Pages vào thư mục DIR')
    a = ap.parse_args()
    if a.site:
        build(os.path.abspath(a.site), True)
    else:
        build(os.path.join(ROOT, 'preview'), False)


if __name__ == '__main__':
    main()
