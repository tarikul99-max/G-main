// ============================================================
// 3D GOLDEN OCEAN BACKGROUND - GLORIOUS EDUCATION CARE
// ============================================================

let scene, camera, renderer, waterGeometry, waterMaterial, boat, sunGroup;
let waveHeight = 4.2;
let waveFrequency = 0.019;
let waveSpeed = 1.2;

// ============================================================
// INITIALIZE 3D SCENE
// ============================================================
function init3DBackground() {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('canvas-container not found');
        return;
    }

    // ==================== SCENE SETUP ====================
    scene = new THREE.Scene();

    // ==================== SKY BACKGROUND ====================
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#4f2a0a');    // Dark brown top
    gradient.addColorStop(0.3, '#c47a0a');  // Golden
    gradient.addColorStop(0.55, '#f5b81b'); // Bright gold
    gradient.addColorStop(0.85, '#fade9c'); // Light gold
    gradient.addColorStop(1, '#f6eedb');    // Cream
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);
    const skyTexture = new THREE.CanvasTexture(canvas);
    scene.background = skyTexture;

    // ==================== CAMERA ====================
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 14, 150);
    camera.lookAt(0, 2, -30);

    // ==================== RENDERER ====================
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // ==================== LIGHTING ====================
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x446688, 0.5);
    scene.add(ambientLight);

    // Main sun light
    const sunLight = new THREE.DirectionalLight(0xffcc55, 2.6);
    sunLight.position.set(20, 120, -400);
    scene.add(sunLight);

    // Fill light for shadows
    const fillLight = new THREE.DirectionalLight(0x88aacc, 0.6);
    fillLight.position.set(-80, 30, -200);
    scene.add(fillLight);

    // ==================== SUN WITH GLOW EFFECT ====================
    sunGroup = new THREE.Group();

    // Sun core
    const sunGeometry = new THREE.SphereGeometry(18, 48, 48);
    const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff3d4,
        emissive: 0xffaa33,
        emissiveIntensity: 0.4,
        roughness: 0.7,
        metalness: 0.0,
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sunMesh);

    // Inner glow
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffaa33,
        transparent: true,
        opacity: 0.20,
        blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(34, 40, 40), glowMat);
    sunGroup.add(glowMesh);

    // Outer glow
    const outerGlowMat = new THREE.MeshBasicMaterial({
        color: 0xff9922,
        transparent: true,
        opacity: 0.10,
        blending: THREE.AdditiveBlending
    });
    const outerGlow = new THREE.Mesh(new THREE.SphereGeometry(65, 32, 32), outerGlowMat);
    sunGroup.add(outerGlow);

    // Sun rays/spikes
    const spikeMat = new THREE.MeshBasicMaterial({
        color: 0xffaa44,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending
    });
    for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12), spikeMat);
        spike.scale.set(1, 0.15, 1);
        spike.rotation.z = (i / 4) * Math.PI;
        sunGroup.add(spike);
    }
    sunGroup.position.set(0, 110, -460);
    scene.add(sunGroup);

    // ==================== SAND / GROUND ====================
    const sandGeometry = new THREE.PlaneGeometry(1400, 700);
    const sandMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b5a3a,
        roughness: 0.85,
        metalness: 0.05,
    });
    const sandMesh = new THREE.Mesh(sandGeometry, sandMaterial);
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.set(0, -22, 320);
    scene.add(sandMesh);

    // ==================== WATER / OCEAN ====================
    waterGeometry = new THREE.PlaneGeometry(2000, 2000, 180, 180);

    // Vertex colors for depth effect
    const colors = [];
    const position = waterGeometry.attributes.position;
    const shallowColor = new THREE.Color(0x3fbcb5);
    const deepColor = new THREE.Color(0x124b6e);

    for (let i = 0; i < position.count; i++) {
        const y = position.getY(i);
        const ratio = THREE.MathUtils.clamp((y + 700) / 1400, 0, 1);
        const mixedColor = new THREE.Color().lerpColors(deepColor, shallowColor, ratio);
        colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
    }
    waterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    waterMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.06,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.92,
        envMapIntensity: 0.4,
    });

    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -1.5, -180);
    scene.add(waterMesh);

    // ==================== BUILDINGS / CITYSCAPE ====================
    const buildingData = [
        { width: 40, height: 120, depth: 35, x: -220, z: 400, color: 0x1c2a33 },
        { width: 50, height: 150, depth: 40, x: -120, z: 430, color: 0x1f2e3a },
        { width: 45, height: 130, depth: 38, x: 120, z: 420, color: 0x1f2e3a },
        { width: 30, height: 90, depth: 30, x: 230, z: 400, color: 0x1c2a33 }
    ];

    buildingData.forEach(data => {
        const buildGeo = new THREE.BoxGeometry(data.width, data.height, data.depth);
        const buildMat = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.8,
            metalness: 0.2
        });
        const building = new THREE.Mesh(buildGeo, buildMat);
        building.position.set(data.x, data.height / 2 - 22, data.z);
        scene.add(building);
    });

    // ==================== BOAT ====================
    boat = new THREE.Group();

    // Boat body
    const bodyGeo = new THREE.CylinderGeometry(2.2, 4.2, 13, 6, 1);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2c241e,
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.92
    });
    const boatBody = new THREE.Mesh(bodyGeo, bodyMat);
    boatBody.rotation.x = Math.PI / 2;
    boatBody.scale.set(1, 2.4, 0.6);
    boat.add(boatBody);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(3.8, 3.8, 5.5);
    const cabinMat = new THREE.MeshStandardMaterial({
        color: 0x1a1410,
        roughness: 0.9,
        transparent: true,
        opacity: 0.9
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 2.2, -0.8);
    boat.add(cabin);

    // Mast
    const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 10);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 5.2, 2.8);
    boat.add(mast);

    // Flag
    const flagGeo = new THREE.BoxGeometry(0.08, 1.4, 2.2);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xee9605, roughness: 0.8 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0, 9.8, 1.6);
    boat.add(flag);

    scene.add(boat);

    // ==================== RESIZE HANDLER ====================
    window.addEventListener('resize', onWindowResize);

    console.log('🌊 3D Golden Ocean initialized successfully!');
}

// ============================================================
// OCEAN WAVE CALCULATION
// ============================================================
function getRealOceanWave(x, z, time) {
    const mainWave = Math.sin(x * waveFrequency + time * waveSpeed) * waveHeight;
    const secondaryWave = Math.cos(z * (waveFrequency * 1.3) - time * (waveSpeed * 0.7)) * (waveHeight * 0.35);
    const tinyChop = Math.sin((x - z) * waveFrequency * 2.8 + time * waveSpeed * 1.8) * 0.6;
    return mainWave + secondaryWave + tinyChop;
}

// ============================================================
// WINDOW RESIZE HANDLER
// ============================================================
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate3DBackground() {
    requestAnimationFrame(animate3DBackground);

    const time = performance.now() * 0.001;

    // ==================== ANIMATE WATER WAVES ====================
    if (waterGeometry) {
        const positionAttribute = waterGeometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const zEffects = getRealOceanWave(x, y, time);
            positionAttribute.setZ(i, zEffects);
        }
        waterGeometry.computeVertexNormals();
        waterGeometry.attributes.position.needsUpdate = true;
    }

    // ==================== ANIMATE BOAT ====================
    if (boat) {
        const boatX = 2.5;
        const boatZ = -75;
        const boatY = getRealOceanWave(boatX, -boatZ, time);
        boat.position.set(boatX, boatY + 0.9, boatZ);

        // Boat tilt based on wave angle
        const nextY = getRealOceanWave(boatX + 1.8, -boatZ, time);
        const sideY = getRealOceanWave(boatX, -(boatZ + 1.8), time);
        boat.rotation.z = (boatY - nextY) * 0.2;
        boat.rotation.x = (sideY - boatY) * 0.2;
        boat.rotation.y = Math.sin(time * 0.035) * 0.07;
    }

    // ==================== ANIMATE SUN GLOW ====================
    if (sunGroup) {
        const pulse = 1 + Math.sin(time * 0.25) * 0.006;
        if (sunGroup.children[1]) {
            sunGroup.children[1].scale.set(pulse, pulse, pulse);
        }
        if (sunGroup.children[2]) {
            sunGroup.children[2].scale.set(pulse * 1.02, pulse * 1.02, pulse * 1.02);
        }
    }

    // ==================== RENDER ====================
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// ============================================================
// CONFIGURATION FUNCTIONS
// ============================================================

// Wave height adjustment
function setWaveHeight(height) {
    waveHeight = height;
}

// Wave speed adjustment
function setWaveSpeed(speed) {
    waveSpeed = speed;
}

// Wave frequency adjustment
function setWaveFrequency(frequency) {
    waveFrequency = frequency;
}

// ============================================================
// INITIALIZE
// ============================================================
console.log('🚀 Starting 3D Golden Ocean Background...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        init3DBackground();
        animate3DBackground();
    });
} else {
    init3DBackground();
    animate3DBackground();
}

// ============================================================
// EXPOSE TO GLOBAL SCOPE FOR DEBUGGING
// ============================================================
window.__scene = scene;
window.__camera = camera;
window.__renderer = renderer;
window.__boat = boat;
window.__sun = sunGroup;
window.__setWaveHeight = setWaveHeight;
window.__setWaveSpeed = setWaveSpeed;
window.__setWaveFrequency = setWaveFrequency;

console.log('✅ 3D Ocean loaded successfully!');
console.log('💡 Debug: Use window.__boat, window.__sun, window.__setWaveHeight()');
