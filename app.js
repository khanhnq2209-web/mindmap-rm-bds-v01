const MAPS = [
  { file: "maps/cccc.html", title: "Chung cư cao cấp", meta: "CCCC" },
  { file: "maps/btlk.html", title: "Biệt thự, liền kề", meta: "BTLK" },
  { file: "maps/ks.html", title: "Khách sạn", meta: "KS" },
  { file: "maps/vphs.html", title: "Văn phòng hạng sang", meta: "VPHS" },
];

const LIGHT_CSS = `
:root { color-scheme: light only !important; }
html, body, #mindmap, svg, .markmap { background: #f5f6f8 !important; color: #1a2332 !important; }
.markmap-dark, html.markmap-dark, html.markmap-dark body { background: #f5f6f8 !important; color: #1a2332 !important; }
svg text, svg tspan { fill: #1a2332 !important; }
svg foreignObject, svg foreignObject * { color: #1a2332 !important; }
svg foreignObject code { background: #eef0f4 !important; color: #1a2332 !important; }
svg path.markmap-link, svg line { stroke: #94a3b8 !important; }
`;

const $ = (id) => document.getElementById(id);
const frame = $("frame");
const msg = $("msg");
const title = $("title");
const nav = $("nav");
const buttons = [];

function patchHtml(html) {
  return html
    .replace(
      /if\s*\(\s*window\.matchMedia\([^)]+\)\s*\.matches\s*\)\s*\{[^}]*markmap-dark[^}]*\}/g,
      "document.documentElement.classList.remove('markmap-dark');"
    )
    .replace(
      /\.markmap-dark\s*\{\s*background:\s*#27272a;\s*color:\s*white;\s*\}/g,
      ".markmap-dark{background:#f5f6f8;color:#1a2332}"
    )
    .replace("</head>", `<style id="gelex-light">${LIGHT_CSS}</style></head>`);
}

function applyLight(doc) {
  if (!doc) return;
  try {
    doc.documentElement.classList.remove("markmap-dark");
    let el = doc.getElementById("gelex-light");
    if (!el) {
      el = doc.createElement("style");
      el.id = "gelex-light";
      doc.head.appendChild(el);
    }
    el.textContent = LIGHT_CSS;
    doc.querySelectorAll("svg text").forEach((t) => t.setAttribute("fill", "#1a2332"));
  } catch (_) {}
}

function afterLoad() {
  [0, 200, 600, 1500, 3000].forEach((ms) =>
    setTimeout(() => applyLight(frame.contentDocument), ms)
  );
}

function showError(text) {
  msg.textContent = text;
  msg.hidden = false;
  frame.hidden = true;
}

function showMap() {
  msg.hidden = true;
  frame.hidden = false;
}

function loadMap(file) {
  if (!file || file.includes("..")) return showError("Đường dẫn không hợp lệ.");

  const onReady = () => {
    afterLoad();
    showMap();
  };

  if (location.protocol === "file:") {
    frame.onload = () => {
      frame.onload = null;
      onReady();
    };
    frame.src = file;
    return;
  }

  fetch(file)
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
    .then(patchHtml)
    .then((html) => {
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      frame.onload = () => {
        frame.onload = null;
        setTimeout(() => URL.revokeObjectURL(url), 500);
        onReady();
      };
      frame.src = url;
    })
    .catch(() => showError(`Không tải được ${file}. Chạy start.bat hoặc kiểm tra maps/.`));
}

function openMap(item, btn, push = true) {
  title.textContent = item.title;
  const badge = $("badge");
  if (badge) {
    badge.textContent = item.meta;
    badge.hidden = false;
  }
  buttons.forEach((b) => b.classList.toggle("active", b === btn));
  if (push) history.replaceState(null, "", `?map=${encodeURIComponent(item.file)}`);
  loadMap(item.file);
}

function buildNav() {
  MAPS.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-item";
    btn.innerHTML = `<span class="nav-title">${item.title}</span><span class="nav-meta">${item.meta}</span>`;
    btn.onclick = () => openMap(item, btn);
    nav.appendChild(btn);
    buttons.push(btn);

    if (location.protocol !== "file:") {
      fetch(item.file, { method: "HEAD" })
        .then((r) => {
          if (!r.ok) btn.classList.add("missing");
        })
        .catch(() => btn.classList.add("missing"));
    }
  });
}

function init() {
  buildNav();
  const param = new URLSearchParams(location.search).get("map");
  const item = MAPS.find((m) => m.file === param) || MAPS[0];
  const idx = MAPS.indexOf(item);
  if (item && buttons[idx]) openMap(item, buttons[idx], !!param && item.file === param);
}

init();
