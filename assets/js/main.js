// ============================
// PRELOADER
// ============================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 1200);
});

// ============================
// CURSOR GLOW (desktop only)
// ============================
const cursorGlow = document.getElementById('cursor-glow');
if (window.matchMedia('(pointer: fine)').matches && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
}

// ============================
// FEATURE CARD GLOW FOLLOW
// ============================
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.querySelector('.feature-glow').style.setProperty('--glow-x', x + '%');
        card.querySelector('.feature-glow').style.setProperty('--glow-y', y + '%');
    });
});

// ============================
// HEADER SCROLL
// ============================
const header = document.getElementById('main-header');
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================
// MOBILE NAVIGATION
// ============================
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('mobile-open');
    document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ============================
// SMOOTH SCROLLING
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ============================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================
const animateElements = document.querySelectorAll('[data-animate]');
const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, parseInt(delay));
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

animateElements.forEach(el => observer.observe(el));

// ============================
// COUNTER ANIMATION
// ============================
const statNumbers = document.querySelectorAll('.stat-number[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                if (current >= 1000) {
                    el.textContent = current.toLocaleString();
                } else {
                    el.textContent = current;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    if (target >= 1000) {
                        el.textContent = target.toLocaleString();
                    } else {
                        el.textContent = target;
                    }
                }
            }

            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// ============================
// THREE.JS — HERO 3D SCENE
// ============================
let heroScene, heroCamera, heroRenderer;
let heroParticles, heroGeometry, heroMaterial;
let heroTorus, heroIcosahedron, heroOctahedron;
let heroMouseX = 0, heroMouseY = 0;

function initHeroScene() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    heroCamera.position.z = 30;

    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setSize(container.clientWidth, container.clientHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(heroRenderer.domElement);

    // --- Particle Field ---
    const particleCount = 1500;
    heroGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const primaryColor = new THREE.Color(0x6C5CE7);
    const accentColor = new THREE.Color(0x00cec9);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Sphere distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 15 + Math.random() * 20;

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        const mixFactor = Math.random();
        const color = primaryColor.clone().lerp(accentColor, mixFactor);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    heroGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    heroGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    heroMaterial = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    heroParticles = new THREE.Points(heroGeometry, heroMaterial);
    heroScene.add(heroParticles);

    // --- Wireframe Torus Knot ---
    const torusGeo = new THREE.TorusKnotGeometry(5, 1.5, 128, 32, 2, 3);
    const torusMat = new THREE.MeshBasicMaterial({
        color: 0x6C5CE7,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    heroTorus = new THREE.Mesh(torusGeo, torusMat);
    heroTorus.position.set(12, 0, -5);
    heroScene.add(heroTorus);

    // --- Wireframe Icosahedron ---
    const icoGeo = new THREE.IcosahedronGeometry(4, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        color: 0x00cec9,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    heroIcosahedron = new THREE.Mesh(icoGeo, icoMat);
    heroIcosahedron.position.set(-10, -5, -8);
    heroScene.add(heroIcosahedron);

    // --- Wireframe Octahedron ---
    const octGeo = new THREE.OctahedronGeometry(3, 0);
    const octMat = new THREE.MeshBasicMaterial({
        color: 0xa29bfe,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    heroOctahedron = new THREE.Mesh(octGeo, octMat);
    heroOctahedron.position.set(-14, 8, -10);
    heroScene.add(heroOctahedron);

    // Mouse interaction
    document.addEventListener('mousemove', (e) => {
        heroMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        heroMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation
    function animateHero() {
        requestAnimationFrame(animateHero);

        const time = Date.now() * 0.0005;

        heroParticles.rotation.y = time * 0.15 + heroMouseX * 0.1;
        heroParticles.rotation.x = heroMouseY * 0.05;

        heroTorus.rotation.x = time * 0.4;
        heroTorus.rotation.y = time * 0.3;
        heroTorus.position.y = Math.sin(time * 1.5) * 1.5;

        heroIcosahedron.rotation.x = time * 0.5;
        heroIcosahedron.rotation.z = time * 0.3;
        heroIcosahedron.position.y = -5 + Math.sin(time * 1.2 + 1) * 2;

        heroOctahedron.rotation.x = time * 0.6;
        heroOctahedron.rotation.y = time * 0.4;
        heroOctahedron.position.y = 8 + Math.cos(time * 1.1) * 1.5;

        heroRenderer.render(heroScene, heroCamera);
    }

    animateHero();

    window.addEventListener('resize', () => {
        heroCamera.aspect = container.clientWidth / container.clientHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ============================
// THREE.JS — STATS 3D SCENE
// ============================
let statsScene, statsCamera, statsRenderer;
let statsParticles;

function initStatsScene() {
    const container = document.getElementById('stats-canvas');
    if (!container) return;

    statsScene = new THREE.Scene();
    statsCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    statsCamera.position.z = 20;

    statsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    statsRenderer.setSize(container.clientWidth, container.clientHeight);
    statsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(statsRenderer.domElement);

    // Grid of glowing dots
    const gridCount = 400;
    const gridGeo = new THREE.BufferGeometry();
    const gridPos = new Float32Array(gridCount * 3);
    const gridColors = new Float32Array(gridCount * 3);

    for (let i = 0; i < gridCount; i++) {
        const i3 = i * 3;
        gridPos[i3] = (Math.random() - 0.5) * 60;
        gridPos[i3 + 1] = (Math.random() - 0.5) * 30;
        gridPos[i3 + 2] = (Math.random() - 0.5) * 20;

        const t = Math.random();
        gridColors[i3] = 0.42 * (1 - t) + 0 * t;
        gridColors[i3 + 1] = 0.36 * (1 - t) + 0.81 * t;
        gridColors[i3 + 2] = 0.91 * (1 - t) + 0.79 * t;
    }

    gridGeo.setAttribute('position', new THREE.BufferAttribute(gridPos, 3));
    gridGeo.setAttribute('color', new THREE.BufferAttribute(gridColors, 3));

    const gridMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    statsParticles = new THREE.Points(gridGeo, gridMat);
    statsScene.add(statsParticles);

    function animateStats() {
        requestAnimationFrame(animateStats);
        const time = Date.now() * 0.0003;
        statsParticles.rotation.y = time * 0.2;
        statsParticles.rotation.x = Math.sin(time * 0.5) * 0.1;
        statsRenderer.render(statsScene, statsCamera);
    }

    animateStats();

    window.addEventListener('resize', () => {
        statsCamera.aspect = container.clientWidth / container.clientHeight;
        statsCamera.updateProjectionMatrix();
        statsRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ============================
// THREE.JS — CTA 3D SCENE
// ============================
let ctaScene, ctaCamera, ctaRenderer;
let ctaRing, ctaParticles;

function initCtaScene() {
    const container = document.getElementById('cta-canvas');
    if (!container) return;

    ctaScene = new THREE.Scene();
    ctaCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    ctaCamera.position.z = 15;

    ctaRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ctaRenderer.setSize(container.clientWidth, container.clientHeight);
    ctaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(ctaRenderer.domElement);

    // Rotating ring
    const ringGeo = new THREE.TorusGeometry(6, 0.1, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x6C5CE7,
        transparent: true,
        opacity: 0.3
    });
    ctaRing = new THREE.Mesh(ringGeo, ringMat);
    ctaScene.add(ctaRing);

    // Second ring
    const ring2Geo = new THREE.TorusGeometry(8, 0.08, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x00cec9,
        transparent: true,
        opacity: 0.2
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ctaScene.add(ring2);

    // Particles orbiting
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const r = 4 + Math.random() * 8;
        pPos[i3] = Math.cos(angle) * r;
        pPos[i3 + 1] = (Math.random() - 0.5) * 8;
        pPos[i3 + 2] = Math.sin(angle) * r;

        const t = Math.random();
        pColors[i3] = 0.42 * (1 - t) + 0 * t;
        pColors[i3 + 1] = 0.36 * (1 - t) + 0.81 * t;
        pColors[i3 + 2] = 0.91 * (1 - t) + 0.79 * t;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    ctaParticles = new THREE.Points(pGeo, pMat);
    ctaScene.add(ctaParticles);

    function animateCta() {
        requestAnimationFrame(animateCta);
        const time = Date.now() * 0.0004;

        ctaRing.rotation.x = time * 0.5;
        ctaRing.rotation.y = time * 0.3;

        ring2.rotation.y = time * 0.2;
        ring2.rotation.z = time * 0.4;

        ctaParticles.rotation.y = time * 0.15;

        ctaRenderer.render(ctaScene, ctaCamera);
    }

    animateCta();

    window.addEventListener('resize', () => {
        ctaCamera.aspect = container.clientWidth / container.clientHeight;
        ctaCamera.updateProjectionMatrix();
        ctaRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ============================
// FLOATING PARTICLES (CSS-based for hero)
// ============================
function createHeroParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: ${Math.random() > 0.5 ? 'rgba(108, 92, 231, 0.4)' : 'rgba(0, 206, 201, 0.4)'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${8 + Math.random() * 12}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }

    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-particle {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            50% { transform: translateY(-80px) translateX(${Math.random() > 0.5 ? '' : '-'}30px); }
        }
    `;
    document.head.appendChild(style);
}

// ============================
// INITIALIZE EVERYTHING
// ============================
document.addEventListener('DOMContentLoaded', () => {
    createHeroParticles();
});

window.addEventListener('load', () => {
    initHeroScene();
    initStatsScene();
    initCtaScene();
});
