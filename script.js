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

// Molduras focadas em elementos visuais (Sem alteração agressiva de cor na foto)
const presetsSVG = {
    clean: `
        <!-- Borda Dupla Tracejada Verde -->
        <rect x="35" y="35" width="1010" height="1850" rx="15" fill="none" stroke="#22c55e" stroke-width="4" stroke-dasharray="16 10" />
        <rect x="45" y="45" width="990" height="1830" rx="10" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.6" stroke-dasharray="8 6" />

        <!-- Topo: Capelo e Apenas IFPR PINHAIS -->
        <g transform="translate(540, 130)" text-anchor="middle">
            <path d="M -45,-12 L 0,-32 L 45,-12 L 0,8 Z" fill="#22c55e" />
            <path d="M -25,-1 L -25,20 C -25,28 25,28 25,20 L 25,-1" fill="#166534" />
            <path d="M 0,-12 L 32,8 L 32,26" stroke="#facc15" stroke-width="3.5" fill="none" />
            <circle cx="32" cy="28" r="4.5" fill="#facc15" />
            <text y="52" fill="#ffffff" font-family="Inter, sans-serif" font-size="26" font-weight="900" letter-spacing="3">IFPR PINHAIS</text>
        </g>

        <!-- Rodapé Ajustado (Mais alto para não cortar) -->
        <g transform="translate(540, 1680)" text-anchor="middle">
            <rect x="-440" y="-45" width="880" height="90" rx="45" fill="rgba(15, 23, 42, 0.95)" stroke="#22c55e" stroke-width="3" />
            <text y="-8" fill="#ffffff" font-family="Inter, sans-serif" font-size="26" font-weight="900" letter-spacing="1">
                <tspan fill="#f87171">#V_Wipex</tspan>  <tspan fill="#4ade80">#IFPRPINHAIS</tspan>
            </text>
            <text y="24" fill="#94a3b8" font-family="Inter, sans-serif" font-size="20" font-weight="600">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    cyber: `
        <!-- Moldura Cyberpunk (Foco total em elementos de interface / HUD nas bordas) -->
        <defs>
            <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22c55e" />
                <stop offset="50%" stop-color="#06b6d4" />
                <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
        </defs>
        
        <!-- Cantoneiras Tecnológicas -->
        <path d="M 40,160 L 40,50 L 160,50" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 1040,160 L 1040,50 L 920,50" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 40,1760 L 40,1870 L 160,1870" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 1040,1760 L 1040,1870 L 920,1870" stroke="url(#cyber-grad)" stroke-width="12" fill="none" stroke-linecap="round" />

        <!-- Tag Superior -->
        <g transform="translate(80, 80)">
            <rect width="180" height="46" rx="23" fill="rgba(239, 68, 68, 0.9)" />
            <circle cx="28" cy="23" r="7" fill="#ffffff" />
            <text x="48" y="29" fill="#ffffff" font-family="Inter, sans-serif" font-size="18" font-weight="900">CYBER LIVE</text>
        </g>

        <!-- Rodapé Cyber -->
        <g transform="translate(540, 1680)" text-anchor="middle">
            <rect x="-440" y="-45" width="880" height="90" rx="15" fill="rgba(10, 15, 30, 0.95)" stroke="url(#cyber-grad)" stroke-width="4" />
            <text y="-8" fill="#ffffff" font-family="Inter, sans-serif" font-size="26" font-weight="900" letter-spacing="1">
                <tspan fill="#f87171">#V_Wipex</tspan>  <tspan fill="#22c55e">#IFPRPINHAIS</tspan>
            </text>
            <text y="24" fill="#06b6d4" font-family="Inter, sans-serif" font-size="20" font-weight="600">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    starwars: `
        <!-- Moldura Star Wars (Com crédito subindo em perspectiva) -->
        <rect x="35" y="35" width="1010" height="1850" rx="10" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.5" />
        
        <g transform="translate(540, 1150) scale(1, 0.45)" text-anchor="middle">
            <text y="-380" fill="#ffff00" font-family="Inter, sans-serif" font-size="46" font-weight="900" letter-spacing="4">IFPR</text>
            <text y="-300" fill="#38bdf8" font-family="Inter, sans-serif" font-size="38" font-weight="700">____</text>
            <text y="-220" fill="#ffffff" font-family="Inter, sans-serif" font-size="34" font-weight="700">Ensino • Pesquisa • Extensão</text>
            <text y="-130" fill="#4ade80" font-family="Inter, sans-serif" font-size="42" font-weight="900" letter-spacing="2">V WIPEX</text>
            <text y="-30" fill="#ffff00" font-family="Inter, sans-serif" font-size="40" font-weight="900">QUE A FORÇA</text>
            <text y="40" fill="#ffff00" font-family="Inter, sans-serif" font-size="40" font-weight="900">ESTEJA COM VOCÊ</text>
        </g>

        <g transform="translate(540, 1680)" text-anchor="middle">
            <rect x="-440" y="-45" width="880" height="90" rx="10" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" stroke-width="3" />
            <text y="-8" fill="#ffffff" font-family="Inter, sans-serif" font-size="26" font-weight="900">
                <tspan fill="#f87171">#V_Wipex</tspan>  <tspan fill="#38bdf8">#IFPRPINHAIS</tspan>
            </text>
            <text y="24" fill="#94a3b8" font-family="Inter, sans-serif" font-size="20" font-weight="600">Ensino • Pesquisa • Extensão</text>
        </g>
    `,

    poster: `
        <!-- Moldura Pôster (Estética de Desenho / Ilustração artística) -->
        <rect x="30" y="30" width="1020" height="1860" rx="20" fill="none" stroke="#f59e0b" stroke-width="8" />
        <rect x="50" y="50" width="980" height="1820" rx="10" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="12 12" />

        <!-- Selo de Pôster Ilustrado no Topo -->
        <g transform="translate(540, 140)" text-anchor="middle">
            <rect x="-240" y="-40" width="480" height="75" rx="35" fill="#f59e0b" stroke="#ffffff" stroke-width="3" />
            <text y="6" fill="#1e293b" font-family="Inter, sans-serif" font-size="30" font-weight="900" letter-spacing="2">⭐ EDIÇÃO PÔSTER ⭐</text>
        </g>

        <!-- Rodapé Pôster -->
        <g transform="translate(540, 1680)" text-anchor="middle">
            <rect x="-440" y="-45" width="880" height="90" rx="45" fill="#f59e0b" stroke="#ffffff" stroke-width="3" />
            <text y="-8" fill="#1e293b" font-family="Inter, sans-serif" font-size="26" font-weight="900" letter-spacing="1">
                <tspan fill="#b91c1c">#V_Wipex</tspan>  <tspan fill="#065f46">#IFPRPINHAIS</tspan>
            </text>
            <text y="24" fill="#1e293b" font-family="Inter, sans-serif" font-size="20" font-weight="700">Ensino • Pesquisa • Extensão</text>
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
        permissionScreen.style.display = 'none';
        alert('A câmera foi bloqueada ou não é suportada. Tire uma foto com a câmera do seu celular e use o botão "Galeria"!');
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
    drawContain(ctx, sourceEl, 1080, 1920);

    if (currentPreset === 'clean') {
        applySkinSmoothEffect(ctx, 1080, 1920);
    }

    processOverlayAndExport(ctx);
});

function applySkinSmoothEffect(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, (data[i] - 128) * 1.02 + 128 + 8);
        data[i+1] = Math.min(255, (data[i+1] - 128) * 1.02 + 128 + 8);
        data[i+2] = Math.min(255, (data[i+2] - 128) * 1.02 + 128 + 8);
    }
    ctx.putImageData(imgData, 0, 0);
}

// Enquadramento sem zoom (tamanho normal proporcional)
function drawContain(ctx, img, targetWidth, targetHeight) {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const imgWidth = img.videoWidth || img.naturalWidth || targetWidth;
    const imgHeight = img.videoHeight || img.naturalHeight || targetHeight;

    const targetRatio = targetWidth / targetHeight;
    const imgRatio = imgWidth / imgHeight;

    let dw = targetWidth;
    let dh = targetHeight;
    let dx = 0;
    let dy = 0;

    if (imgRatio > targetRatio) {
        dh = targetWidth / imgRatio;
        dy = (targetHeight - dh) / 2;
    } else {
        dw = targetHeight * imgRatio;
        dx = (targetWidth - dw) / 2;
    }

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, dx, dy, dw, dh);
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
