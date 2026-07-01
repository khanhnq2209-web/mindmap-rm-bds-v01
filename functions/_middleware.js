/**
 * Cloudflare Pages — Basic Auth (tuỳ chọn).
 * Set biến môi trường SITE_PASSWORD trên Pages dashboard.
 * Nếu không set → middleware bỏ qua (site public).
 */
export async function onRequest(context) {
  const expected = context.env.SITE_PASSWORD;
  if (!expected) {
    return context.next();
  }

  const auth = context.request.headers.get("Authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const password = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : decoded;
      if (password === expected) {
        return context.next();
      }
    }
  }

  return new Response("Unauthorized — GELEX Mindmap RM", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="GELEX Mindmap", charset="UTF-8"',
    },
  });
}
