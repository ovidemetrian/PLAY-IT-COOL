/* about.js: tap the MADE BY OVI badge to open the app's own "About / how it was made" page.
   Same drop-in for every one of Ovi's PWAs:
     1. put this file next to index.html
     2. add  <script src="about.js" defer></script>
     3. add the content as  <script type="application/json" id="about"> {...} </script>
   Content shape: { "title", "tagline", "sections": [{ "h", "p" | "list": [] }], "links": [{ "label", "url" }], "credit" }
   Dragging the badge still moves it; only a short tap opens the page. */
(() => {
  "use strict";
  const badge = document.querySelector(".badge, #badge");
  const src = document.getElementById("about");
  if (!badge || !src) return;
  let data;
  try { data = JSON.parse(src.textContent); } catch { return; }

  const css = `
  .about { position: fixed; inset: 0; z-index: 40; display: grid; place-items: center; background: #05020acc;
    opacity: 0; pointer-events: none; transition: opacity .35s ease; }
  .about.open { opacity: 1; pointer-events: auto; }
  .about-box { position: relative; color: #fff; text-align: left; font-family: inherit; width: min(100vw, 100vh); width: min(100vw, 100svh); aspect-ratio: 1; container-type: size;
    display: flex; flex-direction: column; background: linear-gradient(160deg, #1a0d2ef2, #0b0614f7 55%, #0a1a3af2);
    border: 1px solid #ffffff30; transform: scale(.96); transition: transform .35s cubic-bezier(.2, .8, .2, 1); }
  .about.open .about-box { transform: none; }
  .about-head { display: flex; align-items: center; gap: 3cqw; padding: 4cqw 5cqw 2.5cqw; border-bottom: 1px solid #ffffff26; }
  .about-head h2 { flex: 1; margin: 0; font-size: 7cqw; line-height: 1; color: #fff; letter-spacing: .03em; }
  .about-x { width: 9cqw; height: 9cqw; min-height: 0; padding: 0; border-radius: 50%; font: inherit; font-size: 4.5cqw; display: grid; place-items: center;
    color: #fff; background: #ffffff14; border: 1px solid #ffffff60; cursor: pointer; }
  .about-body { flex: 1; min-height: 0; overflow: auto; padding: 3cqw 5cqw 5cqw; -webkit-overflow-scrolling: touch; }
  .about-tag { margin: 0 0 3cqw; font-size: 3.4cqw; line-height: 1.35; text-transform: none; letter-spacing: .01em; }
  .about-body h3 { margin: 4cqw 0 1.4cqw; font-size: 3cqw; letter-spacing: .22em; text-transform: uppercase; color: #ffcc00; }
  .about-body p, .about-body li { margin: 0 0 1.6cqw; font-size: 3.1cqw; line-height: 1.45; text-transform: none; letter-spacing: .01em; color: #fffffff0; }
  .about-body ul { margin: 0; padding-left: 4.5cqw; }
  .about-body li::marker { color: #ffcc00; }
  .about-links { display: flex; flex-wrap: wrap; gap: 1.6cqw; margin-top: 1cqw; }
  .about-links a { padding: 1.4cqw 2.6cqw; border: 1px solid #ffffff60; border-radius: 2cqw; color: #fff; text-decoration: none;
    font-size: 2.6cqw; letter-spacing: .06em; background: #ffffff14; }
  .about-credit { margin-top: 5cqw !important; text-align: center; font-size: 2.6cqw !important; color: #ffffffb0 !important; }
  .about-credit b { color: #fff; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wrap = document.createElement("div");
  wrap.className = "about";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-label", "About " + (data.title || "this app"));
  wrap.innerHTML =
    '<div class="about-box">' +
      '<div class="about-head"><h2 class="serif">' + esc(data.title || "About") + '</h2>' +
      '<button type="button" class="about-x" aria-label="Close">✕</button></div>' +
      '<div class="about-body">' +
        (data.tagline ? '<p class="about-tag">' + esc(data.tagline) + '</p>' : "") +
        (data.sections || []).map(s => '<h3>' + esc(s.h) + '</h3>' +
          (s.p ? [].concat(s.p).map(p => '<p>' + esc(p) + '</p>').join("") : "") +
          (s.list ? '<ul>' + s.list.map(li => '<li>' + esc(li) + '</li>').join("") + '</ul>' : "")).join("") +
        (data.links && data.links.length ? '<h3>Links</h3><div class="about-links">' +
          data.links.map(l => '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>').join("") + '</div>' : "") +
        (data.credit ? '<p class="about-credit">' + data.credit + '</p>' : "") +
      '</div>' +
    '</div>';
  document.body.append(wrap);
  const closeBtn = wrap.querySelector(".about-x");
  const body = wrap.querySelector(".about-body");

  let lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    body.scrollTop = 0;
    wrap.classList.add("open");
    document.body.classList.add("about-open");
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    wrap.classList.remove("open");
    document.body.classList.remove("about-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  closeBtn.addEventListener("click", close);
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && wrap.classList.contains("open")) close(); });

  // a short tap opens; a drag just moves the badge
  badge.removeAttribute("aria-hidden");
  badge.setAttribute("role", "button");
  badge.setAttribute("tabindex", "0");
  badge.setAttribute("aria-label", "Made by Ovi. Tap for how this app was made");
  let down = null;
  badge.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  badge.addEventListener("pointerup", e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 500;
    down = null;
    if (moved < 8 && quick) open();
  });
  badge.addEventListener("pointercancel", () => { down = null; });
  badge.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
})();
