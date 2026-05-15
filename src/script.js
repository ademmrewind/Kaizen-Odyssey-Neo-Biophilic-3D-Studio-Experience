// ═══════════════════════════════════════════════════════════════
// KAIZEN ODYSSEY — Main Application
// Neo-Biophilic Ascending Helix with Liquid Shader System
// ═══════════════════════════════════════════════════════════════

import './styles.css';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ─── Zen Garden Image Import ───
import zenGardenImg from './assets/zen_garden.png';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — Tunable Variables
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  // Helix Geometry (Inverted Cone — opens toward the sky)
  helix: {
    startRadius: 4.2,       // Bottom radius (smaller)
    endRadius: 5.2,         // Top radius (larger — growth/evolution)
    spiralGap: 0.55,        // Space between spiral revolutions
    totalTurns: 5,          // Number of full 360° revolutions
    tileWidth: 1.6,         // Individual tile width
    tileHeight: 1.0,        // Individual tile height
    tileDepth: 0.04,        // Subtle panel thickness
    tilesPerTurn: 14,       // Tiles placed per revolution
    tiltAngle: 0.08,        // Slight inward tilt (radians)
    yOffset: -6,            // Vertical centering offset
  },

  // Physics & Interaction
  physics: {
    inertiaSmoothing: 0.04,   // Very high smoothing — floating in oil
    scrollSensitivity: 0.0008,// Scroll-to-rotation mapping
    parallaxStrength: 0.15,   // Mouse parallax rotation intensity
    parallaxSmoothing: 0.03,  // Parallax follow speed (slow, dreamy)
    autoRotateSpeed: 0.015,   // Subtle idle auto-rotation (rad/s)
    velocityDecay: 0.97,      // Long deceleration tail
  },

  // Camera
  camera: {
    fov: 45,
    near: 0.1,
    far: 100,
    position: [0, 0, 18],
  },

  // Palette
  palette: {
    base: new THREE.Color('#121413'),
    accent: new THREE.Color('#c5d1c0'),
    sandstone: new THREE.Color('#e8d8c8'),
    warm: new THREE.Color('#2a2520'),
  },
};

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
const state = {
  scrollY: 0,
  targetRotation: 0,
  currentRotation: 0,
  scrollVelocity: 0,
  smoothVelocity: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  time: 0,
  isReady: false,
  resizeTimeout: null,
};

// ═══════════════════════════════════════════════════════════════
// PROCEDURAL TEXTURE GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Generates organic, nature-inspired textures procedurally using Canvas2D.
 * Each texture has warm, muted earth tones reminiscent of natural materials.
 */
function createProceduralTextures(count) {
  const textures = [];
  const size = 512;
  
  // Organic color palettes (warm earth, sage, stone, moss)
  const palettes = [
    { bg: '#2a2f2a', fg: '#3a4038', accent: '#c5d1c0', name: 'moss' },
    { bg: '#2e2a25', fg: '#3d3530', accent: '#e8d8c8', name: 'sand' },
    { bg: '#252828', fg: '#353a38', accent: '#9aada0', name: 'stone' },
    { bg: '#2a2520', fg: '#3a3028', accent: '#d4c4b0', name: 'clay' },
    { bg: '#222620', fg: '#333830', accent: '#b8c5a8', name: 'leaf' },
    { bg: '#2d2828', fg: '#3e3535', accent: '#c8b8a8', name: 'bark' },
    { bg: '#252a28', fg: '#354038', accent: '#a0b8a5', name: 'fern' },
    { bg: '#2a2825', fg: '#3d3830', accent: '#d8c8b5', name: 'amber' },
  ];

  for (let i = 0; i < count; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const pal = palettes[i % palettes.length];

    // Base gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, pal.bg);
    grad.addColorStop(0.5, pal.fg);
    grad.addColorStop(1, pal.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Organic noise layers
    for (let j = 0; j < 2000; j++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 3 + 0.5;
      const alpha = Math.random() * 0.08;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // Soft flowing lines (material grain)
    ctx.strokeStyle = pal.accent;
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 0.5;
    for (let j = 0; j < 8; j++) {
      ctx.beginPath();
      let x = Math.random() * size;
      let y = Math.random() * size;
      ctx.moveTo(x, y);
      for (let k = 0; k < 20; k++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 20 + 8;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Warm center glow
    const radGrad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.6);
    radGrad.addColorStop(0, `${pal.accent}15`);
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    textures.push(texture);
  }

  return textures;
}

// ═══════════════════════════════════════════════════════════════
// ASCENDING HELIX GEOMETRY
// ═══════════════════════════════════════════════════════════════

/**
 * Creates the Ascending Helix (Inverted Cone Spiral).
 * 
 * The helix is an inverted cone that opens upward, symbolizing growth.
 * startRadius (bottom) < endRadius (top).
 * 
 * Each tile is a slightly curved panel (BoxGeometry with subtle depth)
 * positioned along a parametric spiral path, tangentially aligned
 * to the curve.
 * 
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Texture[]} textures - Array of textures to apply
 * @returns {THREE.Group} The helix group
 */
function createAscendingHelix(scene, textures) {
  const { startRadius, endRadius, spiralGap, totalTurns, tileWidth, tileHeight, 
          tileDepth, tilesPerTurn, tiltAngle, yOffset } = CONFIG.helix;

  const helixGroup = new THREE.Group();
  helixGroup.position.y = yOffset;

  const totalTiles = totalTurns * tilesPerTurn;
  const tintColors = [
    CONFIG.palette.accent,
    CONFIG.palette.sandstone,
    CONFIG.palette.warm,
  ];

  for (let i = 0; i < totalTiles; i++) {
    const t = i / totalTiles; // 0..1 normalized parameter
    const angle = t * totalTurns * Math.PI * 2;
    
    // Inverted cone: radius increases with height
    const radius = startRadius + (endRadius - startRadius) * t;
    
    // Spiral Y position with gap
    const y = t * totalTurns * spiralGap * 2;

    // Position on the spiral
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Create tile geometry (slightly thick panel)
    const geometry = new THREE.BoxGeometry(tileWidth, tileHeight, tileDepth, 4, 4, 1);
    
    // Subtle curvature: bend the tile to follow the cylinder surface
    const posAttr = geometry.getAttribute('position');
    for (let v = 0; v < posAttr.count; v++) {
      const vx = posAttr.getX(v);
      const vy = posAttr.getY(v);
      const vz = posAttr.getZ(v);
      
      // Apply slight cylindrical curvature
      const curveFactor = 0.03;
      const curveOffset = Math.pow(vx / (tileWidth * 0.5), 2) * curveFactor;
      posAttr.setZ(v, vz - curveOffset);
    }
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // Shader material with liquid glass effects
    const texture = textures[i % textures.length];
    const tintColor = tintColors[i % tintColors.length];

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uScrollVelocity: { value: 0 },
        uOpacity: { value: 0.85 },
        uTintColor: { value: new THREE.Vector3(tintColor.r, tintColor.g, tintColor.b) },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Position on the spiral path
    mesh.position.set(x, y, z);

    // Orient tile to face outward from the spiral center
    // (tangent to the spiral, looking outward)
    mesh.lookAt(0, y, 0);
    mesh.rotateY(Math.PI); // Face outward
    
    // Slight inward tilt for architectural feel
    mesh.rotateX(tiltAngle);

    // Store metadata for animation
    mesh.userData = {
      index: i,
      baseY: y,
      angle: angle,
      radius: radius,
      t: t,
    };

    helixGroup.add(mesh);
  }

  scene.add(helixGroup);
  return helixGroup;
}

// ═══════════════════════════════════════════════════════════════
// SCENE SETUP
// ═══════════════════════════════════════════════════════════════

function initScene() {
  const canvas = document.getElementById('helixCanvas');
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Scene
  const scene = new THREE.Scene();

  // Fog for depth
  scene.fog = new THREE.FogExp2(CONFIG.palette.base.getHex(), 0.035);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
  );
  camera.position.set(...CONFIG.camera.position);

  // Ambient Light (soft, warm)
  const ambientLight = new THREE.AmbientLight(0xf4f3ef, 0.3);
  scene.add(ambientLight);

  // Directional Light (subtle, coming from above-right)
  const dirLight = new THREE.DirectionalLight(0xf4f3ef, 0.4);
  dirLight.position.set(5, 10, 8);
  scene.add(dirLight);

  // Soft fill from below-left
  const fillLight = new THREE.DirectionalLight(0xc5d1c0, 0.15);
  fillLight.position.set(-4, -5, 3);
  scene.add(fillLight);

  return { renderer, scene, camera };
}

// ═══════════════════════════════════════════════════════════════
// LENIS SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════════

function initLenis() {
  const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
  });

  // Sync with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// ═══════════════════════════════════════════════════════════════
// GSAP SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════

function initScrollAnimations() {
  // Section headers
  gsap.utils.toArray('.section-header').forEach((header) => {
    gsap.to(header, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Origin manifesto text
  gsap.utils.toArray('.origin-lead, .origin-text').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.4,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Stats
  gsap.utils.toArray('.stat-item').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Capabilities
  gsap.utils.toArray('.capability-item').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: i * 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Fragments
  gsap.utils.toArray('.fragment-item').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.3,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Resonance
  gsap.utils.toArray('.resonance-title, .resonance-text, .resonance-link, .resonance-location, .resonance-social').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: i * 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// HERO ENTRANCE ANIMATION
// ═══════════════════════════════════════════════════════════════

function playHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.3 });

  // Preloader fade
  tl.to('#preloader', {
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      document.getElementById('preloader').classList.add('is-hidden');
    }
  });

  // Nav fade in
  tl.add(() => {
    document.querySelector('.nav').classList.add('is-visible');
  }, '-=0.3');

  // Hero lines stagger
  tl.to('.hero-line--1', {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: 'power3.out',
  }, '-=0.5');

  tl.to('.hero-line--2', {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: 'power3.out',
  }, '-=1.0');

  tl.to('.hero-line--3', {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: 'power3.out',
  }, '-=1.0');

  // Scroll cue
  tl.to('.hero-scroll-cue', {
    opacity: 1,
    duration: 1.2,
    ease: 'power2.out',
  }, '-=0.6');

  return tl;
}

// ═══════════════════════════════════════════════════════════════
// TOKYO TIME DISPLAY
// ═══════════════════════════════════════════════════════════════

function updateTokyoTime() {
  const el = document.getElementById('tokyoTime');
  if (!el) return;
  
  const now = new Date();
  const tokyoTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
  
  el.textContent = tokyoTime;
}

// ═══════════════════════════════════════════════════════════════
// MAIN INITIALIZATION
// ═══════════════════════════════════════════════════════════════

async function main() {
  // ─── Immediate UI (FCP Optimization) ───
  updateTokyoTime();
  setInterval(updateTokyoTime, 1000);

  // ─── Lenis Smooth Scroll ───
  const lenis = initLenis();

  // ─── Scene Setup ───
  const { renderer, scene, camera } = initScene();

  // ─── Deferred WebGL Work (requestIdleCallback) ───
  // Textures and helix creation are deferred to after FCP
  const startWebGL = () => {
    // Load the real zen garden texture
    const textureLoader = new THREE.TextureLoader();
    const zenTexture = textureLoader.load(zenGardenImg);
    zenTexture.minFilter = THREE.LinearMipMapLinearFilter;
    zenTexture.magFilter = THREE.LinearFilter;

    // Generate procedural textures
    const proceduralTextures = createProceduralTextures(7);
    
    // Combine: real image + procedural
    const allTextures = [zenTexture, ...proceduralTextures];

    // Create the Ascending Helix
    const helixGroup = createAscendingHelix(scene, allTextures);

    // ─── Mouse Parallax ───
    window.addEventListener('mousemove', (e) => {
      state.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ─── Scroll Tracking ───
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      state.scrollY = window.scrollY;
      state.scrollVelocity = state.scrollY - lastScrollY;
      lastScrollY = state.scrollY;
    }, { passive: true });

    // ─── Resize ───
    window.addEventListener('resize', () => {
      clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    });

    // ─── Animation Loop ───
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      state.time = elapsed;

      // ── Smooth scroll velocity
      state.smoothVelocity += (state.scrollVelocity - state.smoothVelocity) * CONFIG.physics.inertiaSmoothing;
      state.scrollVelocity *= CONFIG.physics.velocityDecay;

      // ── Target rotation from scroll
      state.targetRotation += state.smoothVelocity * CONFIG.physics.scrollSensitivity;
      
      // Auto-rotate (idle drift)
      state.targetRotation += CONFIG.physics.autoRotateSpeed * delta;

      // ── Smooth rotation interpolation (oil-like inertia)
      state.currentRotation += (state.targetRotation - state.currentRotation) * CONFIG.physics.inertiaSmoothing;

      // ── Mouse parallax (zero-gravity delay)
      state.mouseX += (state.targetMouseX - state.mouseX) * CONFIG.physics.parallaxSmoothing;
      state.mouseY += (state.targetMouseY - state.mouseY) * CONFIG.physics.parallaxSmoothing;

      // ── Apply transforms to helix group
      helixGroup.rotation.y = state.currentRotation;
      
      // Parallax rotation (subtle tilt)
      helixGroup.rotation.x = state.mouseY * CONFIG.physics.parallaxStrength * 0.5;
      helixGroup.rotation.z = state.mouseX * CONFIG.physics.parallaxStrength * 0.3;

      // ── Update shader uniforms
      helixGroup.children.forEach((mesh) => {
        if (mesh.material && mesh.material.uniforms) {
          mesh.material.uniforms.uTime.value = elapsed;
          mesh.material.uniforms.uScrollVelocity.value = state.smoothVelocity * 0.01;
        }
      });

      // ── Render
      renderer.render(scene, camera);
    }

    animate();
    state.isReady = true;
  };

  // Use requestIdleCallback for deferred WebGL initialization
  if ('requestIdleCallback' in window) {
    requestIdleCallback(startWebGL, { timeout: 200 });
  } else {
    setTimeout(startWebGL, 50);
  }

  // ─── Hero Entrance (runs immediately for FCP) ───
  playHeroEntrance();

  // ─── Scroll Animations ───
  initScrollAnimations();
}

// ─── Boot ───
document.addEventListener('DOMContentLoaded', main);
