const CONFIG_URL = "config.json";

const $ = (id) => document.getElementById(id);
const frame = $("frame");
const msg = $("msg");
const loading = $("loading");
const retryBtn = $("retry");
const titleEl = $("title");
const badge = $("badge");
const nav = $("nav");

let config = null;
let maps = [];
let buttons = [];
let currentItem = null;

function applySite(site) {
  document.title = site.title;
  $("brand").textContent = site.brand;
  $("heading").textContent = site.heading;
  $("subtitle").textContent = site.subtitle;
  $("nav-label").textContent = site.navLabel;
}

function showViewer(state) {
  loading.hidden = state !== "loading";
  msg.hidden = state !== "error";
  retryBtn.hidden = state !== "error";
  // Keep iframe in layout during load so markmap measures real dimensions
  frame.hidden = state === "error";
}

function triggerMapResize() {
  try {
    const mm = frame.contentWindow?.mm;
    if (mm?.fit) mm.fit();
    else frame.contentWindow?.dispatchEvent(new Event("resize"));
  } catch (_) {}
}

function afterMapReady() {
  showViewer("map");
  requestAnimationFrame(() => {
    triggerMapResize();
    setTimeout(triggerMapResize, 50);
    setTimeout(triggerMapResize, 200);
  });
}

function showError(text) {
  msg.textContent = text;
  showViewer("error");
}

function loadMap(file) {
  if (!file || file.includes("..")) {
    showError("Đường dẫn không hợp lệ.");
    return;
  }

  showViewer("loading");

  frame.onload = () => {
    frame.onload = null;
    afterMapReady();
  };

  frame.src = file;
}

function openMap(item, btn, push = true) {
  currentItem = item;
  titleEl.textContent = item.title;
  badge.textContent = item.code;
  badge.hidden = false;
  buttons.forEach((b) => {
    const active = b === btn;
    b.classList.toggle("active", active);
    b.setAttribute("aria-current", active ? "page" : "false");
  });
  if (push) history.replaceState(null, "", `?map=${encodeURIComponent(item.id)}`);
  loadMap(item.file);
}

function buildNav() {
  nav.replaceChildren();
  buttons = [];

  maps.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-item";
    btn.setAttribute("aria-current", "false");
    const titleSpan = document.createElement("span");
    titleSpan.className = "nav-title";
    titleSpan.textContent = item.title;
    const codeSpan = document.createElement("span");
    codeSpan.className = "nav-meta";
    codeSpan.textContent = item.code;
    btn.append(titleSpan, codeSpan);
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

function resolveInitialMap() {
  const param = new URLSearchParams(location.search).get("map");
  if (!param) return { item: maps[0], push: false };

  const byId = maps.find((m) => m.id === param);
  if (byId) return { item: byId, push: true };

  const byFile = maps.find((m) => m.file === param);
  if (byFile) return { item: byFile, push: true };

  return { item: maps[0], push: false };
}

async function loadConfig() {
  const res = await fetch(CONFIG_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.site || !Array.isArray(data.maps) || data.maps.length === 0) {
    throw new Error("invalid config");
  }
  return data;
}

async function init() {
  retryBtn.onclick = () => {
    if (currentItem) openMap(currentItem, buttons[maps.indexOf(currentItem)], false);
    else location.reload();
  };

  try {
    config = await loadConfig();
  } catch {
    const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    showError(
      local
        ? "Không tải được config.json. Chạy start.bat hoặc kiểm tra file cấu hình."
        : "Không tải được config.json. Kiểm tra deploy hoặc file cấu hình trên server."
    );
    return;
  }

  applySite(config.site);
  maps = config.maps;
  buildNav();

  const { item, push } = resolveInitialMap();
  const idx = maps.indexOf(item);
  if (item && buttons[idx]) openMap(item, buttons[idx], push);

  const viewer = document.querySelector(".viewer");
  if (viewer) {
    new ResizeObserver(() => {
      if (!frame.hidden) triggerMapResize();
    }).observe(viewer);
  }
}

init();
