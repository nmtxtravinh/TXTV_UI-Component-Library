#!/usr/bin/env python3
"""
NMTXTV Digital Workspace – xem trước và đóng gói.

  python3 apps/NMTXTV-Workspace/build.py          -> preview/Index.html (mở bằng trình duyệt, không cần Apps Script)
  python3 apps/NMTXTV-Workspace/build.py --dist   -> dist/ (đủ file để clasp push hoặc chép vào Apps Script)

File thư viện TXTV_* và Error.html lấy từ src/ của repo, không chép vào thư mục dự án.
"""
import argparse, os, re, shutil, sys

APP = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(os.path.dirname(APP)), 'src')
LIB = ['TXTV_Head.html', 'TXTV_Styles.html', 'TXTV_Scripts.html', 'TXTV_Server.gs', 'Error.html']
OWN = ['Code.gs', 'Index.html', 'appsscript.json']

SAMPLE = {'USER.initials': 'NA', 'USER.name': 'nguyen van a', 'USER.email': 'nguyen.van.a@tbsgroup.vn'}
INCLUDE_RE = re.compile(r"<\?!=\s*include\(\s*['\"]([\w-]+)['\"]\s*\);?\s*\?>")
DATA_RE = re.compile(r"<\?!=\s*wsData\(\)\s*;?\s*\?>")
PRINT_RE = re.compile(r"<\?=\s*([\w.]+)\s*;?\s*\?>")


def read(name):
    for d in (APP, SRC):
        p = os.path.join(d, name)
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return f.read()
    sys.exit('Không tìm thấy ' + name)


def ws_data():
    """Lấy nguyên khai báo APP_GROUPS / APPS trong Code.gs để bản xem trước dùng đúng dữ liệu thật."""
    code = read('Code.gs')
    parts = []
    for var in ('APP_GROUPS', 'APPS'):
        m = re.search(r'var ' + var + r' = (\[.*?\n\]);', code, re.S)
        if not m:
            sys.exit('Không đọc được ' + var + ' trong Code.gs')
        parts.append('var ' + var + ' = ' + m.group(1) + ';')
    return '(function () { ' + ' '.join(parts) + ' return { groups: APP_GROUPS, apps: APPS }; })()'


def sample():
    m = re.search(r"var LOGO_URL = '([^']*)'", read('Code.gs'))
    return dict(SAMPLE, LOGO_URL=m.group(1) if m else '')


def render(name, depth=0):
    if depth > 10:
        sys.exit('include lồng quá sâu: ' + name)
    html = read(name + '.html')
    html = INCLUDE_RE.sub(lambda m: render(m.group(1), depth + 1), html)
    html = DATA_RE.sub(lambda m: ws_data(), html)
    return PRINT_RE.sub(lambda m: sample().get(m.group(1), ''), html)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dist', action='store_true', help='đóng gói vào dist/ để triển khai')
    a = ap.parse_args()
    if a.dist:
        out = os.path.join(APP, 'dist')
        shutil.rmtree(out, ignore_errors=True)
        os.makedirs(out)
        for f in LIB:
            shutil.copy(os.path.join(SRC, f), out)
        for f in OWN:
            shutil.copy(os.path.join(APP, f), out)
        print('✔ dist/: ' + ', '.join(sorted(os.listdir(out))))
    else:
        out = os.path.join(APP, 'preview')
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, 'Index.html'), 'w', encoding='utf-8') as f:
            f.write(render('Index'))
        print('✔ preview/Index.html')


if __name__ == '__main__':
    main()
