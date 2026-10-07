import { profile, projects, skills, achievements, journey } from "./content.js";
import { initScene } from "./scene.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => window.innerWidth <= 860;

/** tiny DOM helper: h("div", {class:"x"}, child, "text") */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) el.append(kid instanceof Node ? kid : document.createTextNode(kid));
  return el;
}

/* ------------------------------------------------------------------ *
 *  Generated cover art: layered petals in each project's colours
 * ------------------------------------------------------------------ */
function coverSvg([a, b, accent], uid) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 400 260");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("aria-hidden", "true");
  let petals = "";
  const n = 9;
  for (let i = 0; i < n; i++) {
    const rot = (360 / n) * i + (uid % 5) * 7;
    petals += `<ellipse cx="200" cy="82" rx="26" ry="62" transform="rotate(${rot} 200 140)" fill="${accent}" opacity="${0.16 + (i % 3) * 0.08}"/>`;
  }
  let inner = "";
  for (let i = 0; i < 6; i++) {
    inner += `<ellipse cx="200" cy="112" rx="16" ry="34" transform="rotate(${60 * i + 30} 200 140)" fill="#fffaf0" opacity="0.5"/>`;
  }
  svg.innerHTML = `
    <defs><linearGradient id="cg${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="400" height="260" fill="url(#cg${uid})"/>
    <circle cx="340" cy="40" r="70" fill="#fffaf0" opacity="0.28"/>
    <circle cx="48" cy="236" r="54" fill="${accent}" opacity="0.18"/>
    ${petals}${inner}
    <circle cx="200" cy="140" r="15" fill="${accent}"/>
    <circle cx="200" cy="140" r="6" fill="#fffaf0" opacity="0.8"/>`;
  return svg;
}

/* ------------------------------------------------------------------ *
 *  Render static content
 * ------------------------------------------------------------------ */
function renderContent() {
  const [first, ...rest] = profile.name.split(" ");
  document.title = `${profile.name} · Developer Portfolio`;
  $("#brandName").textContent = profile.name;
  $("#footName").textContent = profile.name;
  $("#year").textContent = new Date().getFullYear();
  $("#greeting").textContent = profile.greeting;
  $("#heroName").append(first, rest.length ? " " : "", rest.length ? h("em", {}, rest.join(" ")) : "");
  $("#heroRole").textContent = profile.role;
  $("#heroTag").textContent = profile.tagline;
  if (profile.resume) {
    const b = $("#resumeBtn");
    b.href = profile.resume;
    // only show the button once the file actually exists
    fetch(profile.resume, { method: "HEAD" })
      .then((r) => {
        b.hidden = !r.ok;
      })
      .catch(() => {});
  }

  $("#stats").append(
    ...profile.stats.map((s) =>
      h("li", {}, h("b", { "data-count": s.value, "data-suffix": s.suffix }, `0${s.suffix}`), h("span", {}, s.label))
    )
  );
  $("#aboutText").append(...profile.about.map((t) => h("p", {}, t)));
  $("#facts").append(...profile.facts.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v))));

  const dots = ["var(--sage)", "var(--clay)", "var(--butter)", "var(--rose)"];
  $("#skills-grid").append(
    ...skills.map((g, i) =>
      h(
        "div",
        { class: "skill-card reveal", style: `--dot:${dots[i % dots.length]}` },
        h("h3", {}, g.group),
        h("div", { class: "chips" }, g.items.map((x) => h("span", { class: "chip" }, x)))
      )
    )
  );

  const tints = ["var(--butter)", "var(--rose)", "var(--sage)", "var(--clay)"];
  $("#achGrid").append(
    ...achievements.map((a, i) =>
      h(
        "article",
        { class: "ach reveal", style: `--tint:${tints[i % tints.length]}` },
        h("div", { class: "ach-year" }, a.year),
        h("h3", {}, a.title),
        h("div", { class: "ach-place" }, a.place),
        h("p", {}, a.text)
      )
    )
  );

  $("#timeline").append(
    ...journey.map((j) =>
      h(
        "li",
        { class: "tl-item reveal" },
        h("div", { class: "tl-when" }, j.when),
        h("h3", {}, j.title),
        h("div", { class: "tl-where" }, j.where),
        h("p", {}, j.text)
      )
    )
  );

  const mail = $("#mailLink");
  mail.href = `mailto:${profile.email}`;
  mail.textContent = profile.email;
  $("#socials").append(
    ...profile.socials.map((s) => h("li", {}, h("a", { href: s.href, target: "_blank", rel: "noopener noreferrer" }, s.label)))
  );
}

/* ------------------------------------------------------------------ *
 *  Reveal on scroll + count-up
 * ------------------------------------------------------------------ */
function setupReveal() {
  // stagger siblings
  $$(".reveal").forEach((el) => {
    if (el.style.getPropertyValue("--d")) return;
    const i = [...el.parentElement.children].filter((c) => c.classList.contains("reveal")).indexOf(el);
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
        if (e.target.id === "stats") countUp(e.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));
}

function countUp(list) {
  $$("[data-count]", list).forEach((el) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduced) return void (el.textContent = end + suffix);
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ------------------------------------------------------------------ *
 *  Project modal
 * ------------------------------------------------------------------ */
const modal = $("#modal");
let lastFocus = null;

function openModal(p, uid, trigger) {
  lastFocus = trigger || document.activeElement;
  $("#mCover").replaceChildren(coverSvg(p.colors, 100 + uid));
  $("#mKind").textContent = `${p.kind} · ${p.year}`;
  $("#mTitle").textContent = p.title;
  $("#mDesc").textContent = p.description;
  $("#mList").replaceChildren(...p.highlights.map((t) => h("li", {}, t)));
  $("#mTech").replaceChildren(...p.tech.map((t) => h("span", { class: "chip" }, t)));
  const links = [];
  if (p.links?.live) links.push(h("a", { class: "btn btn-primary", href: p.links.live, target: "_blank", rel: "noopener noreferrer" }, "Live demo ↗"));
  if (p.links?.code) links.push(h("a", { class: "btn btn-ghost", href: p.links.code, target: "_blank", rel: "noopener noreferrer" }, "Source code"));
  $("#mLinks").replaceChildren(...links);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  $(".modal-x", modal).focus();
  ring.pause(true);
}

function closeModal() {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  ring.pause(false);
  lastFocus?.focus?.();
}

modal.addEventListener("click", (e) => e.target.closest("[data-close]") && closeModal());
document.addEventListener("keydown", (e) => {
  if (modal.hidden) return;
  if (e.key === "Escape") return closeModal();
  if (e.key === "Tab") {
    const f = $$("a[href], button", modal).filter((x) => !x.disabled);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
  }
});

/* ------------------------------------------------------------------ *
 *  3D project ring (pure CSS 3D, driven by one rAF loop)
 * ------------------------------------------------------------------ */
const ring = (() => {
  const stage = $("#ringStage");
  const sceneEl = $("#ringScene");
  const title = $("#ringTitle");
  const N = projects.length;
  const step = 360 / N;
  const cards = projects.map((p, i) => {
    const card = h(
      "button",
      { class: "petal-card", type: "button", role: "listitem", "aria-label": `${p.title}, ${p.kind}. Open details` },
      h("div", { class: "petal-cover" }, coverSvg(p.colors, i)),
      h(
        "div",
        { class: "petal-body" },
        h("span", { class: "petal-kind" }, `${p.kind} · ${p.year}`),
        h("h3", {}, p.title),
        h("p", {}, p.summary),
        h("span", { class: "petal-more" }, "View details →")
      )
    );
    sceneEl.append(card);
    return card;
  });

  let radius = 300;
  let angle = 0;
  let snap = null;
  let idleUntil = 0;
  let hover = false;
  let dragging = false;
  let moved = false;
  let visible = false;
  let paused = false;
  let shown = -1;
  let startX = 0;
  let startAngle = 0;
  let lastX = 0;
  let last = performance.now();

  const mod = (n, m) => ((n % m) + m) % m;
  const current = () => mod(Math.round(angle / step), N);

  function layout() {
    const cw = parseFloat(getComputedStyle(stage).getPropertyValue("--cw")) || 290;
    radius = cw / 2 / Math.tan(Math.PI / N) + 40;
    cards.forEach((c, i) => (c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
  }

  function paint() {
    sceneEl.style.transform = `translateZ(${-radius}px) rotateY(${-angle}deg)`;
    cards.forEach((c, i) => {
      const f = Math.cos(((i * step - angle) * Math.PI) / 180); // 1 = facing us
      c.style.opacity = f > -0.1 ? (0.5 + 0.5 * Math.max(0, f)).toFixed(2) : 0;
      c.style.pointerEvents = f > 0.2 ? "auto" : "none";
      c.tabIndex = f > 0.85 ? 0 : -1;
    });
    const idx = current();
    if (idx !== shown) {
      shown = idx;
      const p = projects[idx];
      title.replaceChildren(p.title, h("small", {}, `${idx + 1} of ${N}`));
    }
  }

  function snapTo(i) {
    // shortest way round
    const base = Math.round(angle / step) * step;
    const diff = mod(i - current() + N / 2, N) - N / 2;
    snap = base + diff * step;
  }

  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;
    if (!dragging) {
      if (snap !== null) {
        angle += (snap - angle) * (1 - Math.exp(-dt * 6));
        if (Math.abs(snap - angle) < 0.04) {
          angle = snap;
          snap = null;
          idleUntil = now + 3500;
        }
      } else if (!hover && !paused && !reduced && now > idleUntil) {
        angle += 6 * dt;
      }
    }
    paint();
  }

  // drag
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragging = true;
    moved = false;
    snap = null;
    startX = lastX = e.clientX;
    startAngle = angle;
    stage.classList.add("dragging");
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - startX) > 6) moved = true;
    angle = startAngle - (e.clientX - startX) * 0.32;
    lastX = e.clientX;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging");
    snapTo(current());
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  stage.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && (hover = true));
  stage.addEventListener("pointerleave", () => {
    hover = false;
    idleUntil = performance.now() + 1500;
  });

  cards.forEach((c, i) => {
    c.addEventListener("click", () => {
      if (moved) return;
      if (i === current()) openModal(projects[i], i, c);
      else snapTo(i);
    });
    c.addEventListener("focus", () => i !== current() && snapTo(i));
  });
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") (e.preventDefault(), snapTo(current() + 1));
    if (e.key === "ArrowLeft") (e.preventDefault(), snapTo(current() - 1));
  });
  const go = (d) => () => {
    snapTo(current() + d);
  };
  $("#nextBtn").addEventListener("click", go(1));
  $("#prevBtn").addEventListener("click", go(-1));

  new IntersectionObserver((e) => (visible = e[0].isIntersecting), { rootMargin: "100px" }).observe(stage);
  window.addEventListener("resize", layout);
  layout();
  paint();
  requestAnimationFrame(loop);

  return {
    pause(v) {
      paused = v;
    },
  };
})();

/* ------------------------------------------------------------------ *
 *  Nav, progress, section-aware flower, contact
 * ------------------------------------------------------------------ */
function setupPage(scene) {
  const nav = $("#nav");
  const links = $("#navLinks");
  const toggle = $("#navToggle");
  const bar = $("#progress");
  const sections = $$("section[id]");
  const linkFor = (id) => $(`.nav-links a[href="#${id}"]`);
  let ticking = false;
  let activeId = "";

  const setMenu = (open) => {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  function flowerTarget(sec) {
    if (isMobile()) {
      if (sec.id === "home") return { x: 0, y: 0.48, s: 0.85, o: 1 };
      if (sec.id === "projects") return { x: 0, y: 0, s: 0.9, o: 0.5 };
      return { x: 0.55, y: 0.78, s: 0.5, o: 0.28 };
    }
    const [x, y, s] = (sec.dataset.flower || "0.5,0,1").split(",").map(Number);
    return { x, y, s, o: 1 };
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    nav.classList.toggle("scrolled", y > 24);
    scene?.setScroll(y);

    const mid = innerHeight * 0.45;
    const sec = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom > mid;
    });
    if (sec && sec.id !== activeId) {
      activeId = sec.id;
      $$(".nav-links a").forEach((a) => a.classList.remove("active"));
      linkFor(activeId)?.classList.add("active");
      scene?.setTarget(flowerTarget(sec));
    }
  }
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => {
    activeId = "";
    onScroll();
  });
  update();

  // contact: copy + mailto form (no backend needed)
  const copyBtn = $("#copyBtn");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      const t = h("textarea", { style: "position:fixed;opacity:0" });
      t.value = profile.email;
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1800);
  });

  const form = $("#contactForm");
  const msg = $("#formMsg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = String(d.get("name") || "").trim();
    const email = String(d.get("email") || "").trim();
    const text = String(d.get("message") || "").trim();
    let ok = true;
    for (const [field, valid] of [
      ["name", name.length > 0],
      ["email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)],
      ["message", text.length > 4],
    ]) {
      form.elements[field].classList.toggle("bad", !valid);
      ok = ok && valid;
    }
    msg.classList.toggle("ok", ok);
    if (!ok) {
      msg.textContent = "Please fill in all fields with a valid email.";
      return;
    }
    msg.textContent = "Opening your mail app…";
    const subject = encodeURIComponent(`Hello from ${name}`);
    const body = encodeURIComponent(`${text}\n\n— ${name} (${email})`);
    location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  });
  form.addEventListener("input", (e) => e.target.classList.remove("bad"));
}

/* ------------------------------------------------------------------ */
renderContent();
setupReveal();
let scene = null;
try {
  scene = initScene($("#scene"), { reducedMotion: reduced });
} catch (err) {
  console.warn("3D scene unavailable:", err);
}
if (!scene) document.body.classList.add("no-webgl");
setupPage(scene);
