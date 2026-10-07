import * as THREE from "../vendor/three.module.min.js";

/* ------------------------------------------------------------------ *
 *  Procedural flower
 *  Every petal is a small curved grid mesh with a vertex-colour
 *  gradient. Rings of petals open progressively towards the centre,
 *  and the seed head is laid out on a golden-angle spiral.
 * ------------------------------------------------------------------ */
function makePetal({ length, width, open, curl, base, tip }) {
  const su = 12;
  const sv = 6;
  const pos = [];
  const col = [];
  const idx = [];
  const cBase = new THREE.Color(base);
  const cTip = new THREE.Color(tip);
  const c = new THREE.Color();
  const edge = new THREE.Color("#fff4ea");

  for (let i = 0; i <= su; i++) {
    const u = i / su;
    const half = (width / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85);
    for (let j = 0; j <= sv; j++) {
      const v = (j / sv) * 2 - 1;
      const x = u * length;
      const y = v * half;
      const z =
        curl * u * u * length * 0.55 + // lengthwise bend
        0.22 * width * v * v * Math.sin(Math.PI * Math.min(1, u * 1.1)) + // cupped cross-section
        0.012 * Math.cos(v * Math.PI * 3) * u * length; // faint veins
      pos.push(x, y, z);
      const t = THREE.MathUtils.smoothstep(u, 0.05, 0.95);
      c.copy(cBase).lerp(cTip, t).lerp(edge, 0.14 * Math.pow(Math.abs(v), 3) * u);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < su; i++) {
    for (let j = 0; j < sv; j++) {
      const a = i * (sv + 1) + j;
      const b = a + sv + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.rotateY(-open); // negative lifts the tip towards the camera
  g.computeVertexNormals();
  return g;
}

function buildFlower() {
  const flower = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.72,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const rings = [
    // leaves / sepals sit behind everything
    { n: 6, length: 2.1, width: 0.95, open: -0.55, curl: 0.05, base: "#7f9a7a", tip: "#a9c0a0", z: -0.2, off: 0.3 },
    { n: 9, length: 2.6, width: 1.3, open: 0.22, curl: 0.14, base: "#e6a59a", tip: "#f7d8cd", z: 0.0, off: 0 },
    { n: 8, length: 2.1, width: 1.2, open: 0.52, curl: 0.16, base: "#dd8b7f", tip: "#f2c1b2", z: 0.07, off: 0.35 },
    { n: 7, length: 1.55, width: 1.0, open: 0.92, curl: 0.2, base: "#d58a74", tip: "#efc6a4", z: 0.14, off: 0.1 },
    { n: 6, length: 1.05, width: 0.72, open: 1.28, curl: 0.22, base: "#d3a04a", tip: "#f2dba0", z: 0.2, off: 0.5 },
  ];

  const petals = [];
  rings.forEach((r, ri) => {
    const geo = makePetal(r);
    for (let i = 0; i < r.n; i++) {
      const m = new THREE.Mesh(geo, mat);
      const jitter = (Math.sin(i * 12.9898 + ri * 78.233) * 43758.5453) % 1; // stable pseudo-random
      m.rotation.z = (i / r.n) * Math.PI * 2 + r.off + jitter * 0.08;
      m.rotation.x = jitter * 0.07;
      m.position.z = r.z;
      m.scale.setScalar(0.95 + Math.abs(jitter) * 0.1);
      flower.add(m);
      petals.push({ mesh: m, ring: ri, s: m.scale.x });
    }
  });

  // seed head: golden-angle spiral
  const count = 110;
  const seed = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.6 }), count);
  const palette = ["#b8803a", "#d9a441", "#e8c27a", "#a9703a"].map((h) => new THREE.Color(h));
  const dummy = new THREE.Object3D();
  const rMax = 0.075 * Math.sqrt(count);
  for (let k = 0; k < count; k++) {
    const r = 0.075 * Math.sqrt(k + 0.5);
    const a = k * 2.399963;
    const dome = 1 - Math.pow(r / rMax, 2);
    dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.3 + 0.32 * dome);
    dummy.updateMatrix();
    seed.setMatrixAt(k, dummy.matrix);
    seed.setColorAt(k, palette[(k * 7) % palette.length]);
  }
  flower.add(seed);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.64, 24, 16),
    new THREE.MeshStandardMaterial({ color: "#b98440", roughness: 0.8 })
  );
  dome.scale.z = 0.5;
  dome.position.z = 0.28;
  flower.add(dome);

  return { flower, petals };
}

/* ------------------------------------------------------------------ *
 *  Ambient pollen (shader points) + drifting petals (instanced)
 * ------------------------------------------------------------------ */
const POLLEN_VERT = /* glsl */ `
  uniform float uTime, uScroll, uScale, uSpeed;
  attribute float aSize, aSeed;
  attribute vec3 aColor;
  varying vec3 vC;
  varying float vA;
  void main() {
    vec3 p = position;
    float depth = (p.z + 4.0) / 9.0;
    float y = p.y + uTime * (0.12 + aSeed * 0.2) * uSpeed + uScroll * (0.002 + depth * 0.004);
    y = mod(y + 7.0, 14.0) - 7.0;
    p.y = y;
    p.x += sin(uTime * 0.5 * uSpeed + aSeed * 40.0) * 0.35;
    p.z += cos(uTime * 0.4 * uSpeed + aSeed * 20.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / -mv.z;
    vC = aColor;
    vA = (0.35 + 0.5 * fract(aSeed * 7.3)) * smoothstep(-7.0, -5.5, y) * (1.0 - smoothstep(5.5, 7.0, y));
  }
`;
const POLLEN_FRAG = /* glsl */ `
  varying vec3 vC;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * vA;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vC, a);
    #include <colorspace_fragment>
  }
`;

function buildPollen(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const pal = ["#e3bd72", "#d98f8c", "#9db497", "#e9c3a4", "#fff6ea", "#c9785d"].map((h) => new THREE.Color(h));
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, -4 + Math.random() * 9], i * 3);
    size[i] = 0.05 + Math.random() * 0.14;
    seed[i] = Math.random();
    const c = pal[Math.floor(Math.random() * pal.length)];
    color.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  const mat = new THREE.ShaderMaterial({
    vertexShader: POLLEN_VERT,
    fragmentShader: POLLEN_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uScale: { value: 600 }, uSpeed: { value: 1 } },
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

function buildDrifters(count) {
  const geo = makePetal({ length: 0.42, width: 0.24, open: 0.25, curl: 0.25, base: "#ffffff", tip: "#fff1ea" });
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const pal = ["#e6a59a", "#f0c6b4", "#d98f8c", "#e9cf94", "#bcd0b5"].map((h) => new THREE.Color(h));
  const state = [];
  for (let i = 0; i < count; i++) {
    mesh.setColorAt(i, pal[i % pal.length]);
    state.push({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 12,
      z: -2 + Math.random() * 6,
      vy: 0.18 + Math.random() * 0.3,
      sway: 0.3 + Math.random() * 0.7,
      ph: Math.random() * 6.28,
      rx: Math.random() * 6.28,
      ry: Math.random() * 6.28,
      rz: Math.random() * 6.28,
      sp: 0.4 + Math.random() * 0.9,
      s: 0.7 + Math.random() * 0.8,
    });
  }
  mesh.frustumCulled = false;
  return { mesh, state };
}

/* ------------------------------------------------------------------ *
 *  Scene controller
 * ------------------------------------------------------------------ */
export function initScene(canvas, { reducedMotion = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (e) {
    return null;
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.z = 14;

  scene.add(new THREE.HemisphereLight(0xfff3e4, 0xd9c9b0, 0.95));
  const key = new THREE.DirectionalLight(0xffecd2, 1.7);
  key.position.set(3, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe2d0, 0.6);
  fill.position.set(-5, -2, 4);
  scene.add(fill);

  // flower: anchor (position/scale) > tilt (mouse) > bloom (spin)
  const anchor = new THREE.Group();
  const tilt = new THREE.Group();
  const bloom = new THREE.Group();
  const { flower, petals } = buildFlower();
  bloom.add(flower);
  tilt.add(bloom);
  anchor.add(tilt);
  scene.add(anchor);

  const pollen = buildPollen(reducedMotion ? 90 : 170);
  scene.add(pollen);
  const drifters = buildDrifters(reducedMotion ? 0 : 34);
  if (drifters.mesh.count) scene.add(drifters.mesh);

  const target = { x: 0.5, y: 0, s: 1, o: 1 };
  const cur = { x: 0.5, y: 0, s: 1, o: 1 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollY = window.scrollY;
  let lastScrollY = scrollY;
  let spin = 0;
  let boost = 0;
  let intro = 0;
  let raf = 0;
  let running = true;
  let halfH = 1;
  let halfW = 1;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
    pollen.material.uniforms.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }
  resize();
  window.addEventListener("resize", resize);

  const onMove = (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 3.2);

    // smooth towards the section's target placement
    for (const key2 of ["x", "y", "s", "o"]) cur[key2] += (target[key2] - cur[key2]) * k;
    canvas.style.opacity = cur.o.toFixed(3);

    mouse.x += (mouse.tx - mouse.x) * k;
    mouse.y += (mouse.ty - mouse.y) * k;

    // scroll velocity gives the spin a push in the scroll direction
    const dy = scrollY - lastScrollY;
    lastScrollY = scrollY;
    boost += (Math.max(-60, Math.min(60, dy)) * 0.0035 - boost) * Math.min(1, dt * 6);
    const idle = reducedMotion ? 0.06 : 0.22;
    spin += dt * idle + boost;
    bloom.rotation.z = spin;

    // opening animation
    intro = Math.min(1, t / 2.4);
    const open = easeOutBack(intro);
    for (const p of petals) {
      const delay = p.ring === 0 ? 0 : p.ring * 0.06;
      const e = Math.max(0, Math.min(1, (open - delay) / (1 - delay)));
      p.mesh.scale.setScalar(p.s * Math.max(0.001, e));
    }

    const fit = Math.min(1, (halfW * 2 * 0.64) / 5.4, (halfH * 2 * 0.78) / 5.4 * 1.15);
    anchor.position.set(cur.x * halfW, cur.y * halfH + Math.sin(t * 0.8) * 0.12, 0);
    anchor.scale.setScalar(cur.s * fit * (0.6 + 0.4 * open));
    tilt.rotation.x = -0.62 + mouse.y * 0.14 + Math.sin(t * 0.5) * 0.04;
    tilt.rotation.y = mouse.x * 0.28 + Math.sin(t * 0.37) * 0.1;

    // ambient layers
    const u = pollen.material.uniforms;
    u.uTime.value = t;
    u.uScroll.value = scrollY;
    u.uSpeed.value = reducedMotion ? 0.25 : 1;
    pollen.rotation.y = mouse.x * 0.06;
    pollen.rotation.x = mouse.y * 0.03;

    if (drifters.mesh.count) {
      drifters.state.forEach((d, i) => {
        d.y -= d.vy * dt * 0.8 + boost * 0.4;
        if (d.y < -6.5) d.y = 6.5;
        if (d.y > 6.5) d.y = -6.5;
        dummy.position.set(d.x + Math.sin(t * d.sway + d.ph) * 0.8, d.y, d.z);
        dummy.rotation.set(d.rx + t * d.sp, d.ry + t * d.sp * 0.7, d.rz + t * d.sp * 0.4);
        dummy.scale.setScalar(d.s * 0.7);
        dummy.updateMatrix();
        drifters.mesh.setMatrixAt(i, dummy.matrix);
      });
      drifters.mesh.instanceMatrix.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      running = false;
    } else if (!running) {
      running = true;
      clock.getDelta();
      frame();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  frame();

  return {
    /** x / y are -1..1 across the viewport, s scales the flower, o is canvas opacity */
    setTarget(next) {
      Object.assign(target, next);
    },
    setScroll(y) {
      scrollY = y;
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
    },
  };
}
