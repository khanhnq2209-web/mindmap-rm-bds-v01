# Site mindmap GELEX

## Local
1. Export Markmap → `maps/` (tên file theo `config.json`)
2. Chạy **`start.bat`** → `http://127.0.0.1:3456`

## Cloudflare Pages

### Cách 1 — Connect Git (khuyến nghị)
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Chọn repo `mindmap-rm-bds-v01`
3. **Build settings:**
   - Framework preset: **None**
   - Build command: *(để trống)*
   - Build output directory: **`/`** (root)
4. **Deploy** — mỗi lần push `main` sẽ tự deploy

### Cách 2 — Wrangler CLI
```bat
deploy.bat
```
Hoặc: `npx wrangler pages deploy . --project-name mindmap-rm-bds-v01`

Lần đầu cần đăng nhập: `npx wrangler login`

### Bảo mật (tuỳ chọn)
| Cách | Ghi chú |
|------|---------|
| **Cloudflare Access** | Khuyến nghị cho nội bộ — Zero Trust, SSO |
| **`SITE_PASSWORD`** | Biến môi trường trên Pages → Settings → Environment variables. Dùng Basic Auth qua `functions/_middleware.js`. User/pass tùy ý (chỉ password được kiểm tra). |

Không set `SITE_PASSWORD` → site public.

### Checklist sau deploy
- [ ] Trang chủ load sidebar + mindmap đầu tiên
- [ ] Chuyển tab phân khúc → iframe đổi map
- [ ] URL `?map=cccc` mở đúng phân khúc
- [ ] Nếu có password: nhập một lần, config + maps đều load

### Lưu ý kỹ thuật
- **`_headers`**: trang chính `DENY` iframe ngoài; `maps/*` dùng `SAMEORIGIN` để embed nội bộ
- **`config.json`**: `Cache-Control: no-cache` — sửa config deploy lại là có hiệu lực
- Mindmap HTML load script từ **cdn.jsdelivr.net** — cần internet khi xem

## Thêm mindmap
1. Export HTML vào `maps/` (vd. `maps/segment-moi.html`)
2. Thêm mục vào mảng `maps` trong **`config.json`**:

```json
{
  "id": "segment-moi",
  "file": "maps/segment-moi.html",
  "title": "Tên hiển thị trên tab",
  "code": "ABC"
}
```

- `id` — dùng trong URL (`?map=segment-moi`)
- `file` — đường dẫn file HTML
- `title` — tiêu đề tab / header
- `code` — mã phân khúc (badge)

Có thể sửa thông tin site trong `config.json` → `site`.
