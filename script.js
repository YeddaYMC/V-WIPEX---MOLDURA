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

const presetsSVG = {
    clean: `
        <g transform="translate(540, 140)" text-anchor="middle">
            <path d="M -40,-10 L 0,-28 L 40,-10 L 0,8 Z" fill="#15803d" />
            <path d="M -22,-1 L -22,18 C -22,26 22,26 22,18 L 22,-1" fill="#166534" />
            <path d="M 0,-10 L 28,8 L 28,24" stroke="#eab308" stroke-width="3" fill="none" />
            <circle cx="28" cy="26" r="4" fill="#eab308" />
            <text y="45" fill="#ffffff" font-family="Inter, sans-serif" font-size="24" font-weight="700" letter-spacing="3">IFPR CAMPUS PINHAIS</text>
        </g>
        <g transform="translate(540, 1720)" text-anchor="middle">
            <rect x="-440" y="-60" width="880" height="95" rx="47" fill="rgba(15, 23, 42, 0.9)" stroke="#22c55e" stroke-width="3" />
            <text y="-14" fill="#4ade80" font-family="Inter, sans-serif" font-size="24" font-weight="900" letter-spacing="1">#ifpr.oficial  #ifprpinhaisoficial</text>
            <text y="22" fill="#ffffff" font-family="Inter, sans-serif" font-size="28" font-weight="900" letter-spacing="2">#V_WIPEX</text>
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
        <path d="M 50,150 L 50,50 L 150,50" stroke="url(#cyber-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M 1030,150 L 1030,50 L 930,50" stroke="url(#cyber-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M 50,1770 L 50,1870 L 150,1870" stroke="url(#cyber-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <path d="M 1030,1770 L 1030,1870 L 930,1870" stroke="url(#cyber-grad)" stroke-width="14" fill="none" stroke-linecap="round" />
        <g transform="translate(80, 90)">
            <rect width="180" height="46" rx="23" fill="rgba(239, 68, 68, 0.9)" />
            <circle cx="28" cy="23" r="7" fill="#ffffff" />
            <text x="48" y="29" fill="#ffffff" font-family="Inter, sans-serif" font-size="18" font-weight="900">CYBER LIVE</text>
        </g>
        <g transform="translate(540, 1710)" text-anchor="middle">
            <rect x="-440" y="-65" width="880" height="100" rx="15" fill="rgba(10, 15, 30, 0.95)" stroke="url(#cyber-grad)" stroke-width="4" />
            <text y="-20" fill="#22c55e" font-family="Inter, sans-serif" font-size="24" font-weight="900" letter-spacing="1">#ifpr.oficial  #ifprpinhaisoficial</text>
            <text y="20" fill="#ffffff" font-family="Inter, sans-serif" font-size="30" font-weight="900" letter-spacing="2">#V_WIPEX</text>
        </g>
    `,

    tech: `
        <rect x="40" y="40" width="1000" height="1840" rx="15" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="20 10" />
        <g fill="#22c55e" font-family="monospace" font-size="20" opacity="0.65" font-weight="700">
            <text x="70" y="250">0 1 0 1 1 0 1</text>
            <text x="70" y="320">1 0 1 1 0 1 0</text>
            <text x="70" y="390">0 1 1 0 1 0 0</text>
            <text x="910" y="250" text-anchor="end">1 0 1 0 0 1 1</text>
            <text x="910" y="320" text-anchor="end">0 1 0 1 1 0 1</text>
            <text x="910" y="390" text-anchor="end">1 1 0 0 1 1 0</text>
        </g>
        <g transform="translate(540, 100)" text-anchor="middle">
            <rect x="-260" y="-30" width="520" height="60" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="#22c55e" stroke-width="2" />
            <text y="8" fill="#4ade80" font-family="Inter, sans-serif" font-size="22" font-weight="900" letter-spacing="3">⚡ TECH // V_WIPEX</text>
        </g>
        <g transform="translate(540, 1720)" text-anchor="middle">
            <rect x="-440" y="-55" width="880" height="95" rx="10" fill="rgba(15, 23, 42, 0.95)" stroke="#22c55e" stroke-width="3" />
            <text y="-14" fill="#4ade80" font-family="Inter, sans-serif" font-size="24" font-weight="900">#ifpr.oficial  #ifprpinhaisoficial</text>
            <text y="24" fill="#ffffff" font-family="Inter, sans-serif" font-size="28" font-weight="900">#V_WIPEX</text>
        </g>
    `,

    starwars: `
        <defs>
            <linearGradient id="sw-fade" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#ffff00" stop-opacity="1" />
                <stop offset="70%" stop-color="#ffff00" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#ffff00" stop-opacity="0.1" />
            </linearGradient>
        </defs>
        <rect x="30" y="30" width="1020" height="1860" rx="10" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.4" />
        <g transform="translate(540, 1150) scale(1, 0.45)" text-anchor="middle">
            <text y="-380" fill="#ffff00" font-family="Inter, sans-serif" font-size="46" font-weight="900" letter-spacing="4">IFPR</text>
            <text y="-300" fill="#38bdf8" font-family="Inter, sans-serif" font-size="38" font-weight="700">Educação Publica de Qualidade</text>
            <text y="-220" fill="#ffffff" font-family="Inter, sans-serif" font-size="34" font-weight="700">Ensino • Pesquisa • Extensão</text>
            <text y="-130" fill="#4ade80" font-family="Inter, sans-serif" font-size="42" font-weight="900" letter-spacing="2">V WIPEX</text>
            <text y="-30" fill="#ffff00" font-family="Inter, sans-serif" font-size="40" font-weight="900">QUE A FORÇA</text>
            <text y="40" fill="#ffff00" font-family="Inter, sans-serif" font-size="40" font-weight="900">ESTEJA COM VOCÊ</text>
        </g>
        <g transform="translate(540, 1720)" text-anchor="middle">
            <rect x="-440" y="-55" width="880" height="95" rx="10" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" stroke-width="3" />
            <text y="-14" fill="#38bdf8" font-family="Inter, sans-serif" font-size="24" font-weight="900">#ifpr.oficial  #ifprpinhaisoficial</text>
            <text y="24" fill="#ffffff" font-family="Inter, sans-serif" font-size="28" font-weight="900">#V_WIPEX</text>
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
        alert('Não foi possível acessar a câmera. Tente utilizar uma foto da galeria.');
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

    // Aplica o filtro correspondente e a correção natural de pele na imagem capturada
    applyVideoFilterToCanvas(ctx, currentPreset, 1080, 1920);

    processOverlayAndExport(ctx);
});

function applyVideoFilterToCanvas(ctx, preset, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        if (preset === 'clean') {
            // Suavização leve + Brilho/Contraste natural de pele
            data[i] = Math.min(255, (r - 128) * 1.04 + 128 + 10);
            data[i+1] = Math.min(255, (g - 128) * 1.04 + 128 + 10);
            data[i+2] = Math.min(255, (b - 128) * 1.04 + 128 + 10);
        } else if (preset === 'cyber') {
            data[i] = Math.min(255, r * 1.3 + 20);
            data[i+1] = Math.max(0, g * 0.8 - 10);
            data[i+2] = Math.min(255, b * 1.4 + 30);
        } else if (preset === 'tech') {
            let avg = (r + g + b) / 3;
            data[i] = avg * 0.7;
            data[i+1] = Math.min(255, avg * 1.3 + 20);
            data[i+2] = avg * 0.6;
        } else if (preset === 'starwars') {
            let avg = (r + g + b) / 3;
            data[i] = Math.min(255, avg * 1.2);
            data[i+1] = Math.min(255, avg * 1.1);
            data[i+2] = Math.min(255, avg * 1.3);
        }
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
