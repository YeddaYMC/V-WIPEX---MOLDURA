const video = document.getElementById('webcam');
const userImage = document.getElementById('user-image');
const svgFrame = document.getElementById('svg-frame');
const svgElement = document.getElementById('svg-element');
const viewport = document.getElementById('viewport');
const stickersContainer = document.getElementById('stickers-container');
const canvas = document.getElementById('export-canvas');

const permissionScreen = document.getElementById('permission-screen');
const btnGrantPermission = document.getElementById('btn-grant-permission');

const btnCapture = document.getElementById('btn-capture');
const btnSwitch = document.getElementById('btn-switch');
const uploadPhoto = document.getElementById('upload-photo');
const uploadFrame = document.getElementById('upload-frame');
const stickerButtons = document.querySelectorAll('.btn-sticker[data-sticker]');
const btnClearStickers = document.getElementById('btn-clear-stickers');

const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const btnDownload = document.getElementById('btn-download');
const btnCopyCaption = document.getElementById('btn-copy-caption');
const bntCloseModal = document.getElementById('btn-close-modal');

let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;

// Mapeamento exato dos stickers na pasta "adesivos/" com os seus nomes originais
const stickerSources = {
    audio: 'adesivos/audio1_2.jpeg',
    confetes: 'adesivos/confetes1.webp',
    foguete: 'adesivos/foguete 1_2.jpeg',
    lamp: 'adesivos/lamp.flor.webp',
    lapiseira: 'adesivos/lapiseira1.jpeg',
    seta: 'adesivos/seta1.jpeg',
    wifi: 'adesivos/wifi1.jpeg',
    fogos: 'adesivos/fogos 1.jpeg'
};

// Moldura Polaroid perfeita com centro transparente e textos institucionais
const polaroidTransparentSVG = `
    <defs>
        <mask id="polaroid-mask">
            <rect x="0" y="0" width="1080" height="1920" fill="white" />
            <rect x="80" y="240" width="920" height="1260" rx="10" fill="black" />
        </mask>
    </defs>

    <g mask="url(#polaroid-mask)">
        <rect x="0" y="0" width="1080" height="1920" fill="rgba(0,0,0,0.2)" />
        <rect x="50" y="190" width="980" height="1540" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="3" filter="drop-shadow(0 20px 30px rgba(0,0,0,0.6))" />
    </g>

    <rect x="80" y="240" width="920" height="1260" rx="10" fill="none" stroke="#cbd5e1" stroke-width="3" />

    <!-- Capelo Decorativo na Moldura -->
    <g transform="translate(75, 215) rotate(-12)">
        <path d="M -50,-14 L 0,-36 L 50,-14 L 0,8 Z" fill="#1e293b" stroke="#22c55e" stroke-width="2.5" />
        <path d="M -30,0 L -30,22 C -30,30 30,30 30,22 L 30,0" fill="#1e293b" />
        <path d="M 0,-14 L 35,6 L 35,22" stroke="#facc15" stroke-width="3.5" fill="none" />
        <circle cx="35" cy="24" r="4" fill="#facc15" />
    </g>

    <!-- Texto Superior: IFPR Campus Pinhais -->
    <g transform="translate(540, 140)" text-anchor="middle">
        <text y="0" fill="#22c55e" font-family="Inter, sans-serif" font-size="52" font-weight="900" letter-spacing="5">IFPR PINHAIS</text>
        <text y="42" fill="#ffffff" font-family="Inter, sans-serif" font-size="24" font-weight="700" letter-spacing="3">CAMPUS PINHAIS</text>
    </g>

    <!-- Rodapé da Polaroid: V_WIPEX e Hashes -->
    <g transform="translate(540, 1620)" text-anchor="middle">
        <text y="0" fill="#16a34a" font-family="Inter, sans-serif" font-size="44" font-weight="900" letter-spacing="2">V_WIPEX! 💚</text>
        <text y="32" fill="#334155" font-family="Inter, sans-serif" font-size="22" font-weight="700">Ensino • Pesquisa • Extensão</text>
        <text y="58" fill="#e11d48" font-family="Inter, sans-serif" font-size="16" font-weight="700">#ifpr.oficial #ifprpinhaisoficial #V_WIPEX</text>
    </g>
`;

window.addEventListener('DOMContentLoaded', () => {
    svgElement.innerHTML = polaroidTransparentSVG;
});

// Adicionar Stickers na Tela
stickerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.sticker;
        createStickerElement(stickerSources[type]);
    });
});

btnClearStickers.addEventListener('click', () => {
    stickersContainer.innerHTML = '';
});

function createStickerElement(imageSrc) {
    const div = document.createElement('div');
    div.className = 'draggable-sticker';
    
    const img = document.createElement('img');
    img.src = imageSrc;
    div.appendChild(img);
    
    let posX = window.innerWidth / 2 - 55;
    let posY = window.innerHeight / 2 - 55;
    let scale = 1;
    let rotation = 0;

    div.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;

    let isDragging = false;
    let startX, startY;

    div.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        div.setPointerCapture(e.pointerId);
        e.stopPropagation();
    });

    div.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        div.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
    });

    div.addEventListener('pointerup', (e) => {
        isDragging = false;
        div.releasePointerCapture(e.pointerId);
    });

    div.addEventListener('click', () => {
        scale += 0.2;
        if (scale > 2.2) scale = 0.8;
        rotation += 15;
        div.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
    });

    stickersContainer.appendChild(div);
}

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
        console.error('Erro ao aceder à câmara:', err);
        permissionScreen.style.display = 'none';
        alert('A câmara foi bloqueada ou não é suportada. Tira uma foto com a câmara normal e usa o botão "Galeria"!');
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
            const img = new Image();
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                canvas.width = 1080;
                canvas.height = 1920;
                const sourceEl = isUsingUserImage ? userImage : video;
                drawCover(ctx, sourceEl, 1080, 1920);
                applySnapchatSkinFilter(ctx, 1080, 1920);
                ctx.drawImage(img, 0, 0, 1080, 1920);
                showPreview();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

btnCapture.addEventListener('click', async () => {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const sourceEl = isUsingUserImage ? userImage : video;
    drawCover(ctx, sourceEl, 1080, 1920);

    // Filtro de pele estilo Snapchat aplicado
    applySnapchatSkinFilter(ctx, 1080, 1920);

    // Desenhar moldura Polaroid SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const frameImg = new Image();
    frameImg.onload = async () => {
        ctx.drawImage(frameImg, 0, 0, 1080, 1920);
        URL.revokeObjectURL(blobURL);

        // Desenhar adesivos no Canvas final
        const activeStickers = stickersContainer.querySelectorAll('.draggable-sticker');
        for (const stickerEl of activeStickers) {
            const imgEl = stickerEl.querySelector('img');
            const rect = stickerEl.getBoundingClientRect();
            const scaleX = 1080 / window.innerWidth;
            const scaleY = 1920 / window.innerHeight;
            
            await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.save();
                    ctx.translate(rect.left * scaleX + (rect.width * scaleX) / 2, rect.top * scaleY + (rect.height * scaleY) / 2);
                    ctx.drawImage(img, -70, -70, 140, 140);
                    ctx.restore();
                    resolve();
                };
                img.src = imgEl.src;
            });
        }

        showPreview();
    };
    frameImg.src = blobURL;
});

function applySnapchatSkinFilter(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        r = Math.min(255, (r - 128) * 1.06 + 128 + 14);
        g = Math.min(255, (g - 128) * 1.06 + 128 + 14);
        b = Math.min(255, (b - 128) * 1.06 + 128 + 14);

        if (r > 170 && g > 160 && b > 150) {
            r = Math.min(255, r * 1.04);
            g = Math.min(255, g * 1.04);
            b = Math.min(255, b * 1.04);
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
