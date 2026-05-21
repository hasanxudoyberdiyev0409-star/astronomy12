// ===== ELEMENTS =====
var wrapper = document.getElementById('map3D');
var canvas = document.getElementById('threeCanvas');

if (!wrapper || !canvas) {
    throw new Error("map elementlari topilmadi 🚨");
}

// ===== SCENE =====
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000008);

// ===== CAMERA =====
var camera = new THREE.PerspectiveCamera(
    50,
    wrapper.clientWidth / wrapper.clientHeight,
    0.1,
    10000
);

camera.position.set(0, 300, 600);

// ===== RENDERER =====
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});

renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ===== POST-PROCESSING =====
var composer = null;
var bloomPass = null;

try {
    var renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(wrapper.clientWidth, wrapper.clientHeight),
        2.0, 0.3, 0.5
    );
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    console.log("✨ Post-processing yuklandi!");
} catch(e) {
    console.log("⚠️ Post-processing yuklanmadi");
}

// ===== TEXTURE LOADER =====
var loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous";

// ===== LIGHTS =====
var ambientLight = new THREE.AmbientLight(0x303050, 2.0);
scene.add(ambientLight);

var sunLight = new THREE.DirectionalLight(0xffffff, 100);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 2000;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

var coreLight = new THREE.PointLight(0xffffff, 800, 6000, 0.5);
coreLight.position.set(0, 0, 0);
coreLight.castShadow = true;
coreLight.shadow.mapSize.width = 1024;
coreLight.shadow.mapSize.height = 1024;
scene.add(coreLight);

var warmLight = new THREE.PointLight(0xffcc88, 400, 4000, 1.0);
warmLight.position.set(0, 0, 0);
scene.add(warmLight);

var spreadLight = new THREE.PointLight(0xffaa55, 200, 8000, 2.0);
spreadLight.position.set(0, 0, 0);
scene.add(spreadLight);

// ===== STARFIELD =====
var starGeo = new THREE.BufferGeometry();
var starCount = 10000;
var pos = [];
var colors = [];

for (let i = 0; i < starCount; i++) {
    let radius = 3000 + Math.random() * 2000;
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.acos((Math.random() * 2) - 1);
    
    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.sin(phi) * Math.sin(theta);
    let z = radius * Math.cos(phi);
    
    pos.push(x, y, z);
    
    let colorChoice = Math.random();
    if (colorChoice < 0.1) {
        colors.push(0.6, 0.75, 1.0);
    } else if (colorChoice < 0.2) {
        colors.push(1.0, 0.95, 0.8);
    } else if (colorChoice < 0.25) {
        colors.push(1.0, 0.7, 0.5);
    } else {
        colors.push(0.9, 0.9, 1.0);
    }
}

starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

var starMaterial = new THREE.PointsMaterial({
    size: 2.5,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

var stars = new THREE.Points(starGeo, starMaterial);
scene.add(stars);

// ===== QUYOSH (TO'G'RI O'LCHAM) =====
var SUN_RADIUS = 69.6; // 696,340 km / 10,000

// Quyosh yadrosi
var coreGlowGeometry = new THREE.SphereGeometry(SUN_RADIUS * 0.6, 128, 128);
var coreGlowMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            float pulse = sin(time * 3.0) * 0.03 + 0.97;
            vec3 coreColor = vec3(1.0, 0.98, 0.9);
            gl_FragColor = vec4(coreColor * 5.0 * pulse, 1.0);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
});

var coreGlow = new THREE.Mesh(coreGlowGeometry, coreGlowMaterial);
scene.add(coreGlow);

// Fotosfera
var photosphereGeometry = new THREE.SphereGeometry(SUN_RADIUS, 256, 256);
var photosphereMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        void main() {
            float n = noise(vUv * 10.0 + time * 0.3);
            vec3 color = vec3(1.0, 0.95, 0.75);
            float spot = noise(vUv * 5.0 + time * 0.1);
            if (spot < 0.3) color = mix(color, vec3(0.9, 0.7, 0.4), 0.3);
            float flicker = sin(time * 2.5 + vUv.x * 8.0) * 0.02 + sin(time * 3.5 + vUv.y * 8.0) * 0.02 + 0.98;
            gl_FragColor = vec4(color * 3.0 * flicker, 0.95);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
});

var photosphere = new THREE.Mesh(photosphereGeometry, photosphereMaterial);
scene.add(photosphere);

// Xromosfera
var chromosphereGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.08, 128, 128);
var chromosphereMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 4.0);
            float n = noise(vUv * 8.0 + time * 0.5);
            float intensity = fresnel * (0.5 + n * 0.5);
            gl_FragColor = vec4(vec3(1.0, 0.3, 0.05) * 2.0, intensity * 0.9);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
});

var chromosphere = new THREE.Mesh(chromosphereGeometry, chromosphereMaterial);
scene.add(chromosphere);

// Ichki korona
var innerCoronaGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.3, 128, 128);
var innerCoronaMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 2.5);
            float n = noise(vUv * 6.0 + time * 0.4);
            float pulse = sin(time * 2.0 + n * 3.0) * 0.1 + 0.9;
            float intensity = fresnel * pulse * (0.6 + n * 0.4);
            vec3 glowColor = mix(vec3(1.0, 0.5, 0.1), vec3(1.0, 0.8, 0.3), fresnel);
            gl_FragColor = vec4(glowColor * 2.0, intensity * 0.8);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
});

var innerCorona = new THREE.Mesh(innerCoronaGeometry, innerCoronaMaterial);
scene.add(innerCorona);

// O'rta korona
var midCoronaGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.8, 64, 64);
var midCoronaMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 1.8);
            float pulse = sin(time * 1.2 + fresnel * 2.0) * 0.12 + 0.88;
            float intensity = fresnel * pulse * 0.5;
            vec3 glowColor = mix(vec3(1.0, 0.6, 0.2), vec3(1.0, 0.85, 0.5), fresnel);
            gl_FragColor = vec4(glowColor * 1.5, intensity);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
});

var midCorona = new THREE.Mesh(midCoronaGeometry, midCoronaMaterial);
scene.add(midCorona);

// Tashqi korona
var outerCoronaGeometry = new THREE.SphereGeometry(SUN_RADIUS * 2.5, 48, 48);
var outerCoronaMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
            fresnel = pow(fresnel, 1.3);
            float pulse = sin(time * 0.8 + fresnel * 2.0) * 0.15 + 0.85;
            float intensity = fresnel * pulse * 0.35;
            vec3 glowColor = mix(vec3(1.0, 0.7, 0.3), vec3(1.0, 0.9, 0.6), fresnel);
            gl_FragColor = vec4(glowColor * 1.2, intensity);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
});

var outerCorona = new THREE.Mesh(outerCoronaGeometry, outerCoronaMaterial);
scene.add(outerCorona);

// ===== REALISTIK SAYYORA MA'LUMOTLARI =====
// Masshtab: 1 birlik = 10,000 km
// Quyosh: 69.6 birlik (696,340 km)
// Yupiter: 6.99 birlik (69,911 km) - Quyoshdan 10x kichik
// Yer: 0.637 birlik (6,371 km) - Quyoshdan 109x kichik

var planetData = [
    {
        name: "Merkuriy",
        radius: 0.244,      // 2,440 km
        distance: 579,      // 57.9 million km = 5,790 birlik
        speed: 4.74,
        texture: "../assets/images/mercury_texture.jpg",
        color: 0x8c7e6d
    },
    {
        name: "Venera",
        radius: 0.605,      // 6,052 km
        distance: 1082,     // 108.2 million km
        speed: 3.50,
        texture: "../assets/images/venus_texture.jpg",
        color: 0xe6c229
    },
    {
        name: "Yer",
        radius: 0.637,      // 6,371 km
        distance: 1496,     // 149.6 million km
        speed: 2.98,
        texture: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
        color: 0x2244ff
    },
    {
        name: "Mars",
        radius: 0.339,      // 3,390 km
        distance: 2279,     // 227.9 million km
        speed: 2.41,
        texture: "../assets/images/mars_texture.jpg",
        color: 0xc1440e
    },
    {
        name: "Yupiter",
        radius: 6.99,       // 69,911 km (Quyoshdan 10x kichik)
        distance: 7786,     // 778.6 million km
        speed: 1.31,
        texture: "../assets/images/jupiter_texture.jpg",
        color: 0xd4a574
    },
    {
        name: "Saturn",
        radius: 5.82,       // 58,232 km
        distance: 14335,    // 1,433.5 million km
        speed: 0.97,
        texture: "../assets/images/saturn_texture.jpg",
        color: 0xd6c28d,
        hasRings: true
    },
    {
        name: "Uran",
        radius: 2.54,       // 25,362 km
        distance: 28767,    // 2,876.7 million km
        speed: 0.68,
        texture: "../assets/images/uranus_texture.jpg",
        color: 0x7ec8e3
    },
    {
        name: "Neptun",
        radius: 2.46,       // 24,622 km
        distance: 45030,    // 4,503.0 million km
        speed: 0.54,
        texture: "../assets/images/neptune_texture.jpg",
        color: 0x3f54ba
    }
];

// ===== ORBIT FUNCTION =====
function createOrbit(distance) {
    var curve = new THREE.EllipseCurve(0, 0, distance, distance, 0, 2 * Math.PI, false, 0);
    var points = curve.getPoints(360);
    
    var geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    
    var material = new THREE.LineBasicMaterial({
        color: 0x222233,
        transparent: true,
        opacity: 0.2,
        depthWrite: false
    });
    
    var orbit = new THREE.LineLoop(geometry, material);
    scene.add(orbit);
}

// ===== SAYYORALARNI YARATISH =====
var planets = [];

planetData.forEach(function(data) {
    // Orbita (Merkuriy uchun ham alohida masofada)
    createOrbit(data.distance);
    
    // Sayyora
    var geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    var material = new THREE.MeshStandardMaterial({
        map: loader.load(data.texture),
        roughness: 0.8,
        metalness: 0.1,
        emissive: new THREE.Color(data.color),
        emissiveIntensity: 0.1
    });
    
    var planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    scene.add(planet);
    
    // Saturn halqasi
    if (data.hasRings) {
        var innerRadius = data.radius * 1.4;
        var outerRadius = data.radius * 2.3;
        var ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
        var ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xd6c28d,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
            roughness: 0.6,
            metalness: 0.2
        });
        var ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI * 0.45;
        ring.rotation.z = 0.1;
        planet.add(ring);
    }
    
    planets.push({
        mesh: planet,
        distance: data.distance,
        speed: data.speed,
        angle: Math.random() * Math.PI * 2,
        name: data.name
    });
});

// ===== CAMERA CONTROL =====
var isDragging = false;
var prevX = 0;
var prevY = 0;

var target = {
    theta: 0,
    phi: 1.2,
    radius: 800
};

var current = {
    theta: 0,
    phi: 1.2,
    radius: 800
};

function updateCamera() {
    var x = current.radius * Math.sin(current.phi) * Math.sin(current.theta);
    var y = current.radius * Math.cos(current.phi);
    var z = current.radius * Math.sin(current.phi) * Math.cos(current.theta);
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
}

// ===== EVENTS =====
wrapper.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    
    let dx = e.clientX - prevX;
    let dy = e.clientY - prevY;
    
    target.theta -= dx * 0.004;
    target.phi += dy * 0.004;
    
    target.phi = Math.max(0.1, Math.min(1.5, target.phi));
    
    prevX = e.clientX;
    prevY = e.clientY;
});

wrapper.addEventListener("wheel", (e) => {
    e.preventDefault();
    target.radius += e.deltaY * 0.1;
    target.radius = Math.max(100, Math.min(50000, target.radius));
}, { passive: false });

wrapper.addEventListener("touchstart", (e) => {
    isDragging = true;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
});

window.addEventListener("touchend", () => {
    isDragging = false;
});

window.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    
    let dx = e.touches[0].clientX - prevX;
    let dy = e.touches[0].clientY - prevY;
    
    target.theta -= dx * 0.004;
    target.phi += dy * 0.004;
    
    target.phi = Math.max(0.1, Math.min(1.5, target.phi));
    
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
});

// ===== KLAVIATURA =====
window.addEventListener("keydown", (e) => {
    switch(e.key.toLowerCase()) {
        case 'r':
            target.theta = 0;
            target.phi = 1.2;
            target.radius = 800;
            break;
        case 'f':
            target.theta = 0;
            target.phi = Math.PI / 2;
            break;
        case 't':
            target.theta = 0;
            target.phi = 0.1;
            break;
        case '+':
        case '=':
            target.radius = Math.max(100, target.radius - 50);
            break;
        case '-':
            target.radius = Math.min(50000, target.radius + 50);
            break;
        case 'b':
            if (bloomPass) {
                bloomPass.enabled = !bloomPass.enabled;
                console.log("Bloom: " + (bloomPass.enabled ? "YOQILGAN" : "O'CHIRILGAN"));
            }
            break;
        // Sayyoralarga sakrash
        case '1':
            target.radius = 700;  // Merkuriy
            break;
        case '2':
            target.radius = 1200; // Venera
            break;
        case '3':
            target.radius = 1600; // Yer
            break;
        case '4':
            target.radius = 2400; // Mars
            break;
        case '5':
            target.radius = 8000; // Yupiter
            break;
        case '6':
            target.radius = 15000; // Saturn
            break;
        case '7':
            target.radius = 30000; // Uran
            break;
        case '8':
            target.radius = 46000; // Neptun
            break;
    }
});

// ===== ANIMATION =====
var clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    var deltaTime = clock.getDelta();
    var time = Date.now() * 0.001;
    
    // Sayyoralar harakati
    planets.forEach(function(p) {
        p.angle += p.speed * 0.0005; // Sekinroq harakat (realistik)
        
        p.mesh.position.x = Math.cos(p.angle) * p.distance;
        p.mesh.position.z = Math.sin(p.angle) * p.distance;
        
        p.mesh.rotation.y += 0.001;
    });
    
    // Quyosh animatsiyasi
    coreGlow.material.uniforms.time.value = time;
    coreGlow.rotation.y += 0.002;
    photosphere.material.uniforms.time.value = time;
    photosphere.rotation.y += 0.001;
    chromosphere.material.uniforms.time.value = time;
    chromosphere.rotation.y += 0.0012;
    innerCorona.material.uniforms.time.value = time;
    innerCorona.rotation.y -= 0.0008;
    midCorona.material.uniforms.time.value = time;
    midCorona.rotation.y -= 0.0005;
    outerCorona.material.uniforms.time.value = time;
    outerCorona.rotation.y -= 0.0003;
    
    // Yorug'lik
    var flickerIntensity = Math.sin(time * 3.5) * 30 + Math.sin(time * 7.3) * 18 + Math.sin(time * 13.7) * 10;
    coreLight.intensity = 800 + flickerIntensity;
    warmLight.intensity = 400 + flickerIntensity * 0.6;
    spreadLight.intensity = 200 + flickerIntensity * 0.4;
    
    // Yulduzlar
    stars.rotation.y += 0.0001;
    stars.rotation.x += 0.00003;
    
    // Kamera
    current.theta += (target.theta - current.theta) * 0.08;
    current.phi += (target.phi - current.phi) * 0.08;
    current.radius += (target.radius - current.radius) * 0.08;
    
    updateCamera();
    
    if (composer && bloomPass) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// ===== RESIZE =====
window.addEventListener("resize", () => {
    camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    if (composer) composer.setSize(wrapper.clientWidth, wrapper.clientHeight);
});

// ===== START =====
updateCamera();
animate();

console.log("🌌 REALISTIK QUYOSH TIZIMI");
console.log("☀️ Quyosh radiusi: 69.6 (696,340 km)");
console.log("🪐 Yupiter radiusi: 6.99 (69,911 km) - Quyoshdan 10x kichik");
console.log("🌍 Yer radiusi: 0.637 (6,371 km) - Quyoshdan 109x kichik");
console.log("📏 Masshtab: 1 birlik = 10,000 km");
console.log("🎮 1-8: Sayyoralarga sakrash, Scroll: Zoom");