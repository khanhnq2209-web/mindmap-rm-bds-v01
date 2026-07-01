# Site mindmap GELEX

## Local
1. Export Markmap → `maps/` đặt tên: `cccc.html`, `btlk.html`, `ks.html`, `vphs.html`
2. Chạy **`start.bat`** → `http://127.0.0.1:3456`

## Cloudflare Pages
- Chạy **`deploy.bat`** (hoặc connect Git folder `site`, build command trống)
- Password (tuỳ chọn): Cloudflare Access, hoặc env `SITE_PASSWORD` + `functions/_middleware.js`

## Thêm mindmap
Sửa mảng `MAPS` trong **`app.js`**, export HTML vào `maps/`.
