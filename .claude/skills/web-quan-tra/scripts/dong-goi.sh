#!/usr/bin/env bash
# Đóng gói skill thành file zip để tải lên tài khoản Claude.
# Cách dùng: bash .claude/skills/web-quan-tra/scripts/dong-goi.sh <thư mục repo phengapp> <file zip ra>
# Chép code O Sugar làm bản mẫu (assets/template) và xoá thông tin riêng của quán (tài khoản ngân hàng, địa chỉ, SĐT).
set -euo pipefail
REPO="$(cd "$1" && pwd)"; OUT="$(realpath -m "$2")"
SKILL="$REPO/.claude/skills/web-quan-tra"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cp -r "$SKILL" "$TMP/web-quan-tra"
T="$TMP/web-quan-tra/assets/template"; mkdir -p "$T/public"
cp "$REPO"/public/{index.html,don.html,sw.js,don-moi.mp3} "$T/public/"
cp -r "$REPO/netlify" "$T/"; cp "$REPO"/{netlify.toml,package.json} "$T/"
# Xoá thông tin riêng của O Sugar
sed -i -E 's/export const BANK = \{[^}]*\};/export const BANK = { bank: "TEN_NGAN_HANG", acc: "SO_TAI_KHOAN", holder: "TEN_CHU_TAI_KHOAN" };/' "$T/netlify/lib/pay.mjs"
sed -i -E "s/addr:'[^']*',phone:'[^']*',zalo:'[^']*'/addr:'Địa chỉ quán',phone:'SĐT quán',zalo:''/" "$T/public/index.html"
sed -i -E 's/ignore = .*/# ignore = "case \\"$SITE_NAME\\" in site-khong-dung) exit 0;; *) exit 1;; esac"/' "$T/netlify.toml"
if grep -rqE "00004415524|LE THI VAN ANH|0928 ?0789 ?25|0928078925" "$T"; then echo "Còn thông tin riêng trong bản mẫu, dừng lại." >&2; exit 1; fi
rm -f "$OUT"; (cd "$TMP" && zip -qr "$OUT" web-quan-tra)
echo "Đã tạo $OUT"
