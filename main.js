import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// --- Smooth Scrolling (Lenis) ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom subtle easing
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// --- WebGL Background with Three.js ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 800;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xffffff,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Grid (Subtle)
const gridHelper = new THREE.GridHelper(200, 100, 0xffffff, 0xffffff);
gridHelper.material.opacity = 0.03;
gridHelper.material.transparent = true;
gridHelper.position.y = -10;
scene.add(gridHelper);

// Mouse interaction for WebGL
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) * 0.05;
  mouseY = (event.clientY - windowHalfY) * 0.05;
});

const clock = new THREE.Clock();

function animateWebGL() {
  const elapsedTime = clock.getElapsedTime();

  // Smooth mouse follow
  targetX = mouseX * 0.05;
  targetY = mouseY * 0.05;
  
  particlesMesh.rotation.y += 0.001;
  particlesMesh.rotation.x += 0.0005;

  camera.position.x += (targetX - camera.position.x) * 0.02;
  camera.position.y += (-targetY - camera.position.y) * 0.02;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animateWebGL);
}
animateWebGL();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- Custom Cursor & Emil Kowalski Style Microinteractions ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let outlineX = cursorX;
let outlineY = cursorY;

document.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  
  // Instant dot
  cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
});

// Smooth outline loop
function animateCursor() {
  // Elastic spring physics approximation
  const distX = cursorX - outlineX;
  const distY = cursorY - outlineY;
  outlineX += distX * 0.15;
  outlineY += distY * 0.15;
  
  cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Magnetic buttons
const magneticElements = document.querySelectorAll('[data-magnetic]');

magneticElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(el, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.6,
      ease: "power3.out"
    });
    
    cursorOutline.classList.add('hover');
  });
  
  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)" // Physical, bouncy release
    });
    cursorOutline.classList.remove('hover');
  });
});

// Interactive Tilt Cards
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  const orb = card.querySelector('.glow-orb');
  
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: "power2.out"
    });
    
    if (orb) {
      gsap.to(orb, {
        x: x - 50,
        y: y - 50,
        opacity: 1,
        duration: 0.2
      });
    }
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)"
    });
    
    if (orb) {
      gsap.to(orb, { opacity: 0, duration: 0.5 });
    }
  });
});


// --- GSAP Scroll Animations ---

// 1. Hero Text Reveal
const heroLines = document.querySelectorAll('.hero-title .line, .hero-subtitle .line');
gsap.to(heroLines, {
  y: 0,
  duration: 1.2,
  stagger: 0.1,
  ease: "power4.out",
  delay: 0.2
});

// 2. Cinematic Browser 3D Entry & Scroll Rotation
const browserMockup = document.getElementById('browser-mockup');

// Initial state
gsap.set(browserMockup, { 
  rotateX: 15, 
  rotateY: -10, 
  translateY: 50,
  opacity: 0,
  scale: 0.95
});

// Entry animation
gsap.to(browserMockup, {
  rotateX: 5,
  rotateY: 0,
  translateY: 0,
  opacity: 1,
  scale: 1,
  duration: 2,
  ease: "power3.out",
  delay: 0.5
});

// Scroll-driven rotation (Parallax effect)
gsap.to(browserMockup, {
  rotateX: -10,
  rotateY: 5,
  translateY: -100,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 1
  }
});

// 3. Architecture Exploded View
const archLayers = document.querySelectorAll('.arch-layer');
gsap.set(archLayers, { opacity: 0 });

ScrollTrigger.create({
  trigger: ".architecture",
  start: "top center",
  onEnter: () => {
    gsap.to(archLayers, {
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
});

archLayers.forEach(layer => {
  const speed = layer.getAttribute('data-speed');
  gsap.to(layer, {
    z: "+=" + (50 * speed), // Moves closer or further in 3D
    y: "-" + (30 * speed),
    ease: "none",
    scrollTrigger: {
      trigger: ".architecture",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
    }
  });
});

// 4. Feature Cards Reveal
const features = document.querySelectorAll('.feature-box');
gsap.from(features, {
  y: 100,
  opacity: 0,
  duration: 1,
  stagger: 0.15,
  ease: "back.out(1.5)",
  scrollTrigger: {
    trigger: ".performance",
    start: "top 70%"
  }
});

// Disable standard cursor
document.body.style.cursor = 'none';
document.querySelectorAll('a, button').forEach(el => {
  el.style.cursor = 'none';
});
