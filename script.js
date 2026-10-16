const video = document.getElementById('webcam');
const userImage = document.getElementById('user-image');
const svgFrame = document.getElementById('svg-frame');
const svgElement = document.getElementById('svg-element');
const customFrameImg = document.getElementById('custom-frame-img');
const viewport = document.getElementById('viewport');
const canvas = document.getElementById('export-canvas');

const permissionScreen = document.getElementById('permission-screen');
const btnGrantPermission = document.getElementById('btn-grant-permission');

const btnCapture = document.getElementById('btn-capture');
const btnSwitch = document.getElementById('btn-switch');
const uploadPhoto = document.getElementById('upload-photo');
const uploadFrame = document.getElementById('upload-frame');
const presetButtons = document.querySelectorAll('.btn-preset');

const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const btnDownload = document.getElementById('btn-download');
const btnCloseModal = document.getElementById('btn-close-modal');

let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;
let currentPreset = 'clean';

// Molduras de Altíssimo Impacto Visual com hashtags corretas (#ifpr.oficial, #ifprpinhaisoficial, #V_WIPEX)
const presetsSVG = {
    clean: `
        <defs>
            <linearGradient id="clean-border" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22c55e" />
                <stop offset="100%" stop-color="#15803d" />
            </linearGradient>
        </defs>
        <rect x="25" y="25" width="1030" height="1870" rx="20" fill="none" stroke="url(#clean-border)" stroke-width="6" />
        <rect x="40" y="40" width="1000" height="1840" rx="12" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="14 10" opacity="0.7" />
        <g transform="translate(540, 130)" text-anchor="middle">
            <rect x="-240" y="-45" width="480" height="85" rx="42.5" fill="rgba(15, 23, 42, 0.9)" stroke="#22c55e" stroke-width="3" />
            <path d="M -35,-15 L 0,-32 L 35,-15 L 0,2 Z" fill="#22c55e" />
            <path d="M -20,-3 L -20,15 C -20,22 20,22 20,15 L 20,-3" fill="#166534" />
            <path d="M 0,-15 L 25,2 L 25,18" stroke="#facc15" stroke-width="3" fill="none" />
            <circle cx="25" cy="20" r="4" fill="#facc15" />
            <text y="50" fill="#ffffff" font-family="Inter, sans-serif" font-size="28" font-weight="900" letter-spacing="4">IFPR PINHAIS</text>
        </g>
        <g transform="translate(540, 1690)" text-anchor="middle">
            <rect x="-460" y="-55" width="920" height="105" rx="52.5" fill="rgba(15, 23, 42, 0.95)" stroke="#22c55e" stroke-width="3.5" />
            <text y="-14" fill="#ffffff" font-family="Inter, sans-serif" font-size="23" font-weight="900" letter-spacing="1">
                <tspan fill="#f87171">#ifpr.oficial</tspan> <tspan fill="#38bdf8">#ifprpinhaisoficial</tspan> <tspan fill="#4ade80">#V_WIPEX</tspan>
            </text>
            <text y="22" fill="#94a3b8" font-family="Inter, sans-serif" font-size="21" font-weight="600">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    cyber: `
        <defs>
            <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22c55e" />
                <stop offset="50%" stop-color="#06b6d4" />
                <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
        </defs>
        <path d="M 30,180 L 30,40 L 180,40" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 1050,180 L 1050,40 L 900,40" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 30,1740 L 30,1880 L 180,1880" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 1050,1740 L 1050,1880 L 900,1880" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <line x1="540" y1="30" x2="540" y2="55" stroke="#06b6d4" stroke-width="4" />
        <line x1="540" y1="1865" x2="540" y2="1890" stroke="#06b6d4" stroke-width="4" />
        <g transform="translate(70, 75)">
            <rect width="210" height="50" rx="25" fill="rgba(239, 68, 68, 0.92)" stroke="#ffffff" stroke-width="2" />
            <circle cx="28" cy="25" r="8" fill="#ffffff" />
            <text x="50" y="32" fill="#ffffff" font-family="Inter, sans-serif" font-size="19" font-weight="900" letter-spacing="1">SYSTEM LIVE</text>
        </g>
        <g transform="translate(540, 1690)" text-anchor="middle">
            <rect x="-460" y="-55" width="920" height="105" rx="16" fill="rgba(10, 15, 30, 0.95)" stroke="url(#cyber-grad)" stroke-width="4" />
            <text y="-14" fill="#ffffff" font-family="Inter, sans-serif" font-size="23" font-weight="900" letter-spacing="1">
                <tspan fill="#f87171">#ifpr.oficial</tspan> <tspan fill="#38bdf8">#ifprpinhaisoficial</tspan> <tspan fill="#4ade80">#V_WIPEX</tspan>
            </text>
            <text y="22" fill="#06b6d4" font-family="Inter, sans-serif" font-size="21" font-weight="600">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    starwars: `
        <g fill="#ffffff">
            <circle cx="100" cy="250" r="3.5" opacity="0.9" />
            <circle cx="980" cy="200" r="4.5" fill="#38bdf8" opacity="0.9" />
            <circle cx="920" cy="650" r="2.5" opacity="0.8" />
            <circle cx="150" cy="750" r="4" fill="#facc15" opacity="0.9" />
            <circle cx="200" cy="1200" r="3" opacity="0.8" />
            <circle cx="880" cy="1150" r="4" fill="#38bdf8" opacity="0.9" />
            <circle cx="120" cy="1650" r="3.5" opacity="0.9" />
            <circle cx="950" cy="1600" r="3" fill="#facc15" opacity="0.9" />
        </g>
        <rect x="30" y="30" width="1020" height="1860" rx="15" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.7" />
        <g transform="translate(540, 920) scale(1, 0.42)" text-anchor="middle">
            <text y="-340" fill="#ffff00" font-family="Inter, sans-serif" font-size="56" font-weight="900" letter-spacing="8">IFPR</text>
            <text y="-240" fill="#38bdf8" font-family="Inter, sans-serif" font-size="46" font-weight="800">Campus Pinhais</text>
            <text y="-140" fill="#ffffff" font-family="Inter, sans-serif" font-size="40" font-weight="700">Ensino • Pesquisa • Extensão</text>
            <text y="-30" fill="#4ade80" font-family="Inter, sans-serif" font-size="52" font-weight="900" letter-spacing="4">V WIPEX</text>
            <text y="100" fill="#ffff00" font-family="Inter, sans-serif" font-size="46" font-weight="900">QUE A FORÇA</text>
            <text y="190" fill="#ffff00" font-family="Inter, sans-serif" font-size="46" font-weight="900">ESTEJA COM VOCÊ</text>
        </g>
        <g transform="translate(540, 1690)" text-anchor="middle">
            <rect x="-460" y="-55" width="920" height="105" rx="15" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" stroke-width="3.5" />
            <text y="-14" fill="#ffffff" font-family="Inter, sans-serif" font-size="23" font-weight="900">
                <tspan fill="#f87171">#ifpr.oficial</tspan> <tspan fill="#38bdf8">#ifprpinhaisoficial</tspan> <tspan fill="#4ade80">#V_WIPEX</tspan>
            </text>
            <text y="22" fill="#94a3b8" font-family="Inter, sans-serif" font-size="21" font-weight="600">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    poster: `
        <rect x="25" y="25" width="1030" height="1870" rx="22" fill="none" stroke="#f59e0b" stroke-width="10" />
        <rect x="45" y="45" width="990" height="1830" rx="12" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="16 12" />
        <g transform="translate(540, 140)" text-anchor="middle">
            <path d="M -50,-15 L 0,-38 L 50,-15 L 0,8 Z" fill="#f59e0b" />
            <path d="M -28,0 L -28,24 C -28,34 28,34 28,24 L 28,0" fill="#b45309" />
            <path d="M 0,-15 L 35,8 L 35,28" stroke="#ffffff" stroke-width="4" fill="none" />
            <circle cx="35" cy="30" r="5" fill="#ffffff" />
            <g transform="translate(-270, 15) rotate(-12)">
                <rect x="-40" y="-14" width="80" height="28" rx="6" fill="#fef08a" stroke="#d97706" stroke-width="2.5" />
                <rect x="-9" y="-16" width="18" height="32" fill="#dc2626" />
            </g>
            <g transform="translate(270, 15) rotate(12)">
                <path d="M -35,-18 C -18,-24 0,-18 0,-18 C 0,-18 18,-24 35,-18 L 35,18 C 18,12 0,18 0,18 C 0,18 -18,12 -35,18 Z" fill="#fef08a" stroke="#d97706" stroke-width="2.5" />
                <path d="M 0,-18 L 0,18" stroke="#d97706" stroke-width="2.5" />
            </g>
            <rect x="-220" y="52" width="440" height="60" rx="30" fill="#f59e0b" stroke="#ffffff" stroke-width="3.5" />
            <text y="90" fill="#1e293b" font-family="Inter, sans-serif" font-size="26" font-weight="900" letter-spacing="2">⭐ EDIÇÃO PÔSTER OFICIAL ⭐</text>
        </g>
        <g transform="translate(540, 1690)" text-anchor="middle">
            <rect x="-460" y="-55" width="920" height="105" rx="52.5" fill="#f59e0b" stroke="#ffffff" stroke-width="3.5" />
            <text y="-14" fill="#1e293b" font-family="Inter, sans-serif" font-size="23" font-weight="900" letter-spacing="1">
                <tspan fill="#b91c1c">#ifpr.oficial</tspan> <tspan fill="#1e3a8a">#ifprpinhaisoficial</tspan> <tspan fill="#065f46">#V_WIPEX</tspan>
            </text>
            <text y="22" fill="#1e293b" font-family="Inter, sans-serif" font-size="21" font-weight="800">Ensino • Pesquisa • Extensão</text>
        </g>
    `
};

window.addEventListener('DOMContentLoaded', () => {
    renderPreset('clean');
});

btnGrantPermission.addEventListener('click', async () => {
    const success = await initCamera();
    if (success) {
        permissionScreen.style.display = 'none';
    }
});

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPreset = btn.dataset.preset;
        renderPreset(currentPreset);
    });
});

function renderPreset(presetKey) {
    svgElement.innerHTML = presetsSVG[presetKey];
    viewport.className = 'camera-layer';
    viewport.classList.add(`preset-${presetKey}`);
}

async function initCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);

        video.srcObject = currentStream;
        video.style.display = 'block';
        userImage.style.display = 'none';
        isUsingUserImage = false;
        return true;
    } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        permissionScreen.style.display = 'none';
        alert('A câmera foi bloqueada ou não é suportada. Tire uma foto com a câmera normal do seu celular e use o botão "Galeria"!');
        return false;
    }
}

btnSwitch.addEventListener('click', () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    initCamera();
});

uploadPhoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userImage.src = event.target.result;
            userImage.style.display = 'block';
            video.style.display = 'none';
            isUsingUserImage = true;
            permissionScreen.style.display = 'none';

            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
        reader.readAsDataURL(file);
    }
});

uploadFrame.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            customFrameImg.src = event.target.result;
            customFrameImg.style.display = 'block';
            svgFrame.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

btnCapture.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const sourceEl = isUsingUserImage ? userImage : video;
    drawCover(ctx, sourceEl, 1080, 1920);

    if (currentPreset === 'clean') {
        applyAdvancedSkinAndSmileEnhancement(ctx, 1080, 1920);
    }

    processOverlayAndExport(ctx);
});

function applyAdvancedSkinAndSmileEnhancement(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        r = Math.min(255, (r - 128) * 1.05 + 128 + 12);
        g = Math.min(255, (g - 128) * 1.05 + 128 + 12);
        b = Math.min(255, (b - 128) * 1.05 + 128 + 12);

        if (r > 180 && g > 170 && b > 160) {
            r = Math.min(255, r * 1.06);
            g = Math.min(255, g * 1.06);
            b = Math.min(255, b * 1.06);
        }

        data[i] = r;
        data[i+1] = g;
        data[i+2] = b;
    }
    ctx.putImageData(imgData, 0, 0);
}

function drawCover(ctx, img, targetWidth, targetHeight) {
    const imgWidth = img.videoWidth || img.naturalWidth || targetWidth;
    const imgHeight = img.videoHeight || img.naturalHeight || targetHeight;

    const targetRatio = targetWidth / targetHeight;
    const imgRatio = imgWidth / imgHeight;

    let sw, sh, sx, sy;

    if (imgRatio > targetRatio) {
        sh = imgHeight;
        sw = imgHeight * targetRatio;
        sx = (imgWidth - sw) / 2;
        sy = 0;
    } else {
        sw = imgWidth;
        sh = imgWidth / targetRatio;
        sx = 0;
        sy = (imgHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
}

function processOverlayAndExport(ctx) {
    if (customFrameImg.style.display !== 'none' && customFrameImg.src) {
        ctx.drawImage(customFrameImg, 0, 0, 1080, 1920);
        showPreview();
    } else {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const overlayImg = new Image();
        overlayImg.onload = () => {
            ctx.drawImage(overlayImg, 0, 0, 1080, 1920);
            URL.revokeObjectURL(blobURL);
            showPreview();
        };
        overlayImg.src = blobURL;
    }
}

function showPreview() {
    const dataURL = canvas.toDataURL('image/png');
    previewImage.src = dataURL;
    btnDownload.href = dataURL;
    previewModal.style.display = 'flex';
}

btnCloseModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
});
