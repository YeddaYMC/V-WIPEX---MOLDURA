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

const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const btnDownload = document.getElementById('btn-download');
const btnCloseModal = document.getElementById('btn-close-modal');

let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;

// Moldura exata baseada na referência: Círculo/Halo radiante central, ícones acadêmicos e textos limpos
const haloSVG = `
    <defs>
        <radialGradient id="halo-glow" cx="50%" cy="45%" r="42%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
            <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>

    <!-- Fundo totalmente transparente para a câmera aparecer -->

    <!-- Círculo / Halo de Luz Central -->
    <circle cx="540" cy="780" r="360" fill="url(#halo-glow)" />
    <circle cx="540" cy="780" r="360" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-opacity="0.9" filter="url(#glow-effect)" />

    <!-- Partículas de luz ao redor do anel -->
    <g fill="#ffffff" opacity="0.95">
        <circle cx="300" cy="480" r="4.5" />
        <circle cx="780" cy="460" r="3.5" />
        <circle cx="220" cy="740" r="4" />
        <circle cx="860" cy="700" r="4.5" />
        <circle cx="260" cy="1020" r="3.5" />
        <circle cx="820" cy="1000" r="4" />
        <circle cx="400" cy="400" r="3" />
        <circle cx="680" cy="410" r="3.5" />
    </g>

    <!-- Ícones Acadêmicos em Contorno Branco Flutuando no Halo -->
    <g stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" filter="url(#glow-effect)">
        
        <!-- 1. Bloco de Notas (Topo Esquerda) -->
        <g transform="translate(290, 540) scale(1.4)">
            <rect x="-20" y="-25" width="40" height="50" rx="6" fill="rgba(255,255,255,0.12)" />
            <line x1="-10" y1="-12" x2="10" y2="-12" />
            <line x1="-10" y1="0" x2="10" y2="0" />
            <line x1="-10" y1="12" x2="5" y2="12" />
            <circle cx="-12" cy="-25" r="2" fill="#ffffff" />
            <circle cx="0" cy="-25" r="2" fill="#ffffff" />
            <circle cx="12" cy="-25" r="2" fill="#ffffff" />
        </g>

        <!-- 2. Relógio (Topo Direita) -->
        <g transform="translate(790, 540) scale(1.4)">
            <circle cx="0" cy="0" r="24" fill="rgba(255,255,255,0.12)" />
            <polyline points="0,-10 0,0 8,6" />
            <path d="M -18,-16 L -22,-20" />
            <path d="M 18,-16 L 22,-20" />
        </g>

        <!-- 3. Check (Meio Esquerda) -->
        <g transform="translate(220, 720) scale(1.4)">
            <circle cx="0" cy="0" r="22" fill="rgba(255,255,255,0.12)" />
            <polyline points="-8,0 -2,6 10,-6" stroke-width="4" />
        </g>

        <!-- 4. Calendário (Meio Direita) -->
        <g transform="translate(860, 720) scale(1.4)">
            <rect x="-22" y="-20" width="44" height="44" rx="6" fill="rgba(255,255,255,0.12)" />
            <line x1="-22" y1="-8" x2="22" y2="-8" />
            <line x1="-10" y1="-26" x2="-10" y2="-20" stroke-width="4" />
            <line x1="10" y1="-26" x2="10" y2="-20" stroke-width="4" />
            <circle cx="-11" cy="2" r="2" fill="#ffffff" />
            <circle cx="0" cy="2" r="2" fill="#ffffff" />
            <circle cx="11" cy="2" r="2" fill="#ffffff" />
        </g>

        <!-- 5. Lâmpada (Base Inferior) -->
        <g transform="translate(540, 1120) scale(1.4)">
            <path d="M -14,-6 C -14,-18 14,-18 14,-6 C 14,2 6,8 6,14 L -6,14 C -6,8 -14,2 -14,-6 Z" fill="rgba(255,255,255,0.12)" />
            <line x1="-6" y1="18" x2="6" y2="18" />
            <line x1="-4" y1="22" x2="4" y2="22" />
        </g>
    </g>

    <!-- Texto Superior: IFPR Campus Pinhais -->
    <g transform="translate(540, 150)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="Inter, sans-serif" font-size="52" font-weight="900" letter-spacing="4" filter="url(#glow-effect)">IFPR</text>
        <text y="52" fill="#38bdf8" font-family="Inter, sans-serif" font-size="30" font-weight="700" letter-spacing="2">CAMPUS PINHAIS</text>
    </g>

    <!-- Texto Inferior: V_WIPEX, Ensino Pesquisa Extensão e Hashtags Oficiais -->
    <g transform="translate(540, 1680)" text-anchor="middle">
        <rect x="-480" y="-65" width="960" height="120" rx="20" fill="rgba(10, 15, 30, 0.9)" stroke="#38bdf8" stroke-width="3" />
        <text y="-22" fill="#4ade80" font-family="Inter, sans-serif" font-size="38" font-weight="900" letter-spacing="2">V_WIPEX</text>
        <text y="10" fill="#ffffff" font-family="Inter, sans-serif" font-size="22" font-weight="700">Ensino • Pesquisa • Extensão</text>
        <text y="38" fill="#f87171" font-family="Inter, sans-serif" font-size="18" font-weight="700" letter-spacing="0.5">#ifpr.oficial #ifprpinhaisoficial #V_WIPEX</text>
    </g>
`;

window.addEventListener('DOMContentLoaded', () => {
    svgElement.innerHTML = haloSVG;
});

btnGrantPermission.addEventListener('click', async () => {
    const success = await initCamera();
    if (success) {
        permissionScreen.style.display = 'none';
    }
});

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

    applyAdvancedSkinAndSmileEnhancement(ctx, 1080, 1920);
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
