// Referencias Elementos DOM
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

// Variaveis Estado
let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;
let currentPreset = 'cyber';

// Templates SVG com Hashtags Corrigidas
const presetsSVG = {
    cyber: `
        <defs>
            <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4ade80" />
                <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
        </defs>

        <path d="M 60,180 L 60,60 L 180,60" stroke="url(#neon-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M 1020,180 L 1020,60 L 900,60" stroke="url(#neon-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M 60,1740 L 60,1860 L 180,1860" stroke="url(#neon-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M 1020,1740 L 1020,1860 L 900,1860" stroke="url(#neon-grad)" stroke-width="14" fill="none" stroke-linecap="round" />

        <g transform="translate(80, 100)">
            <rect width="160" height="46" rx="23" fill="rgba(239, 68, 68, 0.9)" />
            <circle cx="28" cy="23" r="7" fill="#ffffff" />
            <text x="48" y="29" fill="#ffffff" font-family="Inter, sans-serif" font-size="18" font-weight="900" letter-spacing="1">AO VIVO</text>
        </g>

        <g transform="translate(680, 100)">
            <rect width="320" height="46" rx="23" fill="rgba(15, 23, 42, 0.85)" stroke="#22c55e" stroke-width="2" />
            <text x="160" y="29" fill="#ffffff" font-family="Inter, sans-serif" font-size="18" font-weight="700" text-anchor="middle">📍 IFPR Campus Pinhais</text>
        </g>

        <g transform="translate(540, 200)" text-anchor="middle">
            <g transform="translate(-160, -25)">
                <rect x="0" y="0" width="22" height="22" rx="4" fill="#22c55e" />
                <rect x="28" y="0" width="22" height="22" rx="4" fill="#ef4444" />
                <rect x="0" y="28" width="22" height="22" rx="4" fill="#22c55e" />
                <rect x="28" y="28" width="22" height="22" rx="4" fill="#22c55e" />
                <rect x="0" y="56" width="22" height="22" rx="4" fill="#22c55e" />
                <rect x="28" y="56" width="22" height="22" rx="4" fill="#22c55e" />
            </g>
            <g transform="translate(140, 0)">
                <path d="M -40,-10 L 0,-28 L 40,-10 L 0,8 Z" fill="#15803d" />
                <path d="M -22,-1 L -22,18 C -22,26 22,26 22,18 L 22,-1" fill="#166534" />
                <path d="M 0,-10 L 28,8 L 28,24" stroke="#eab308" stroke-width="3" fill="none" />
                <circle cx="28" cy="26" r="4" fill="#eab308" />
            </g>
            <text y="75" fill="#ffffff" font-family="Inter, sans-serif" font-size="28" font-weight="700" letter-spacing="4">CAMPUS PINHAIS</text>
        </g>

        <g transform="translate(540, 1700)" text-anchor="middle">
            <rect x="-440" y="-70" width="880" height="95" rx="45" fill="rgba(15, 23, 42, 0.92)" stroke="url(#neon-grad)" stroke-width="3" />
            <text y="-22" fill="#4ade80" font-family="Inter, sans-serif" font-size="24" font-weight="900" letter-spacing="1">#ifpr.oficial  #ifprpinhaisoficial</text>
            <text y="18" fill="#ffffff" font-family="Inter, sans-serif" font-size="30" font-weight="900" letter-spacing="2">#V_WIPEX</text>
            <text y="50" fill="#e2e8f0" font-family="Inter, sans-serif" font-size="18" font-weight="900" letter-spacing="2">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    presenter: `
        <rect x="40" y="40" width="1000" height="1840" rx="30" fill="none" stroke="#22c55e" stroke-width="6" stroke-dasharray="20 10" />

        <g transform="translate(540, 120)" text-anchor="middle">
            <rect x="-220" y="-35" width="440" height="70" rx="35" fill="#15803d" />
            <text y="10" fill="#ffffff" font-family="Inter, sans-serif" font-size="26" font-weight="900">🚀 PROJETO APRESENTADO</text>
        </g>

        <g transform="translate(540, 1690)" text-anchor="middle">
            <rect x="-420" y="-60" width="840" height="110" rx="20" fill="rgba(15, 23, 42, 0.95)" stroke="#22c55e" stroke-width="4" />
            <text y="-18" fill="#4ade80" font-family="Inter, sans-serif" font-size="28" font-weight="900">FEIRA DE CIÊNCIAS & TECNOLOGIA</text>
            <text y="16" fill="#ffffff" font-family="Inter, sans-serif" font-size="20" font-weight="700">#V_WIPEX • #ifprpinhaisoficial</text>
            <text y="40" fill="#94a3b8" font-family="Inter, sans-serif" font-size="16" font-weight="600">#ifpr.oficial</text>
        </g>
    `,

    smooth: `
        <g transform="translate(540, 110)" text-anchor="middle">
            <rect x="-180" y="-30" width="360" height="60" rx="30" fill="rgba(0,0,0,0.6)" stroke="#4ade80" stroke-width="2" />
            <text y="8" fill="#ffffff" font-family="Inter, sans-serif" font-size="22" font-weight="700">✨ Glow & Smooth Filter</text>
        </g>

        <g transform="translate(540, 1760)" text-anchor="middle">
            <text y="-10" fill="#ffffff" font-family="Inter, sans-serif" font-size="34" font-weight="900" letter-spacing="3">#V_WIPEX</text>
            <text y="25" fill="#4ade80" font-family="Inter, sans-serif" font-size="18" font-weight="700">#ifpr.oficial #ifprpinhaisoficial</text>
        </g>
    `
};

// Carregamento Inicial
window.addEventListener('DOMContentLoaded', () => {
    renderPreset('cyber');
});

// Ação do Botão da Tela de Permissão
btnGrantPermission.addEventListener('click', async () => {
    const success = await initCamera();
    if (success) {
        permissionScreen.style.display = 'none';
    }
});

// Troca de Preset de Moldura
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
    if (presetKey === 'smooth') {
        viewport.classList.add('skin-smooth');
    } else {
        viewport.classList.remove('skin-smooth');
    }
}

// Inicializar Câmera
async function initCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode,
                width: { ideal: 1080 },
                height: { ideal: 1920 }
            },
            audio: false
        });

        video.srcObject = currentStream;
        video.style.display = 'block';
        userImage.style.display = 'none';
        isUsingUserImage = false;
        return true;
    } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        alert('Não foi possível acessar a câmera. Tente usar uma foto da galeria.');
        return false;
    }
}

// Inverter Câmera
btnSwitch.addEventListener('click', () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    initCamera();
});

// Upload Foto Galeria
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

// Upload Moldura PNG Customizada
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

// Capturar e Exportar Foto
btnCapture.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const sourceEl = isUsingUserImage ? userImage : video;
    drawCover(ctx, sourceEl, 1080, 1920);

    if (currentPreset === 'smooth') {
        applySkinSmoothEffect(ctx, 1080, 1920);
    }

    processOverlayAndExport(ctx);
});

// Suavização de Pele no Canvas
function applySkinSmoothEffect(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const brightness = 8;
    const contrast = 1.04;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, (data[i] - 128) * contrast + 128 + brightness);
        data[i+1] = Math.min(255, (data[i+1] - 128) * contrast + 128 + brightness);
        data[i+2] = Math.min(255, (data[i+2] - 128) * contrast + 128 + brightness);
    }

    ctx.putImageData(imgData, 0, 0);
}

// Enquadramento Proporcional
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

// Processar Moldura e Exportar
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

// Exibir Modal Prévia
function showPreview() {
    const dataURL = canvas.toDataURL('image/png');
    previewImage.src = dataURL;
    btnDownload.href = dataURL;
    previewModal.style.display = 'flex';
}

// Fechar Modal
btnCloseModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
});
