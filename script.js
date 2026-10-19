const video = document.getElementById('webcam');
const userImage = document.getElementById('user-image');
const stickersContainer = document.getElementById('stickers-container');
const canvas = document.getElementById('export-canvas');

const permissionScreen = document.getElementById('permission-screen');
const btnGrantPermission = document.getElementById('btn-grant-permission');

const btnCapture = document.getElementById('btn-capture');
const btnSwitch = document.getElementById('btn-switch');
const uploadPhoto = document.getElementById('upload-photo');

const btnCustomize = document.getElementById('btn-customize');
const stickersModal = document.getElementById('stickers-modal');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const btnClearStickers = document.getElementById('btn-clear-stickers');
const stickerCards = document.querySelectorAll('.sticker-card');

const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const btnDownload = document.getElementById('btn-download');
const btnCopyCaption = document.getElementById('btn-copy-caption');
const bntCloseModal = document.getElementById('btn-close-modal');

let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;

// Mapeamento exato dos caminhos dos adesivos
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

// Abrir e Fechar Gaveta de Adesivos
if (btnCustomize && stickersModal) {
    btnCustomize.addEventListener('click', () => {
        stickersModal.style.display = 'flex';
    });
}

if (btnCloseDrawer && stickersModal) {
    btnCloseDrawer.addEventListener('click', () => {
        stickersModal.style.display = 'none';
    });
}

// Adicionar Adesivo à Tela
stickerCards.forEach(card => {
    card.addEventListener('click', () => {
        const type = card.dataset.sticker;
        createStickerElement(stickerSources[type]);
        if (stickersModal) {
            stickersModal.style.display = 'none';
        }
    });
});

if (btnClearStickers) {
    btnClearStickers.addEventListener('click', () => {
        stickersContainer.innerHTML = '';
    });
}

function createStickerElement(imageSrc) {
    const div = document.createElement('div');
    div.className = 'draggable-sticker';
    
    const img = document.createElement('img');
    img.src = imageSrc;
    div.appendChild(img);
    
    let posX = window.innerWidth / 2 - 50;
    let posY = window.innerHeight / 2 - 50;
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
        try {
            div.releasePointerCapture(e.pointerId);
        } catch (err) {}
    });

    // Toque para redimensionar/rodar
    div.addEventListener('click', () => {
        scale += 0.2;
        if (scale > 2.0) scale = 0.8;
        rotation += 15;
        div.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
    });

    stickersContainer.appendChild(div);
}

if (btnGrantPermission) {
    btnGrantPermission.addEventListener('click', async () => {
        const success = await initCamera();
        if (success) {
            permissionScreen.style.display = 'none';
        }
    });
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
        console.error('Erro na câmara:', err);
        permissionScreen.style.display = 'none';
        return false;
    }
}

if (btnSwitch) {
    btnSwitch.addEventListener('click', () => {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        initCamera();
    });
}

if (uploadPhoto) {
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
}

// Tirar Foto e Gerar Imagem Final
if (btnCapture) {
    btnCapture.addEventListener('click', async () => {
        const ctx = canvas.getContext('2d');
        canvas.width = 1080;
        canvas.height = 1920;

        const sourceEl = isUsingUserImage ? userImage : video;
        
        // 1. Desenhar a foto de fundo (preenchendo tudo)
        drawCover(ctx, sourceEl, 1080, 1920);

        // 2. Filtro de pele suave
        applySnapchatSkinFilter(ctx, 1080, 1920);

        // 3. Desenhar a moldura Polaroid em cima
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(50, 100, 980, 1720);

        // Janela recortada para a foto aparecer dentro da Polaroid
        ctx.clearRect(90, 140, 900, 1340);
        drawCoverRegion(ctx, sourceEl, 90, 140, 900, 1340);
        applySnapchatSkinFilterRegion(ctx, 90, 140, 900, 1340);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.strokeRect(90, 140, 900, 1340);

        // 4. Textos da Polaroid no Canvas
        ctx.fillStyle = '#16a34a';
        ctx.font = '900 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('V_WIPEX! 💚', 540, 1600);

        ctx.fillStyle = '#334155';
        ctx.font = '700 32px Inter, sans-serif';
        ctx.fillText('Ensino • Pesquisa • Extensão', 540, 1660);

        ctx.fillStyle = '#e11d48';
        ctx.font = '700 24px Inter, sans-serif';
        ctx.fillText('#ifpr.oficial #ifprpinhaisoficial #V_WIPEX', 540, 1720);

        // 5. Desenhar os Adesivos posicionados
        const activeStickers = stickersContainer.querySelectorAll('.draggable-sticker');
        for (const stickerEl of activeStickers) {
            const imgEl = stickerEl.querySelector('img');
            const rect = stickerEl.getBoundingClientRect();
            const scaleX = 1080 / window.innerWidth;
            const scaleY = 1920 / window.innerHeight;
            
            if (imgEl && imgEl.complete && imgEl.naturalWidth !== 0) {
                ctx.save();
                ctx.translate(rect.left * scaleX + (rect.width * scaleX) / 2, rect.top * scaleY + (rect.height * scaleY) / 2);
                ctx.drawImage(imgEl, -75, -75, 150, 150);
                ctx.restore();
            }
        }

        showPreview();
    });
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

function drawCoverRegion(ctx, img, x, y, width, height) {
    const imgWidth = img.videoWidth || img.naturalWidth || width;
    const imgHeight = img.videoHeight || img.naturalHeight || height;
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, width, height);
}

function applySnapchatSkinFilter(ctx, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.05 + 8);
        data[i+1] = Math.min(255, data[i+1] * 1.05 + 8);
        data[i+2] = Math.min(255, data[i+2] * 1.05 + 8);
    }
    ctx.putImageData(imgData, 0, 0);
}

function applySnapchatSkinFilterRegion(ctx, x, y, width, height) {
    const imgData = ctx.getImageData(x, y, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.05 + 8);
        data[i+1] = Math.min(255, data[i+1] * 1.05 + 8);
        data[i+2] = Math.min(255, data[i+2] * 1.05 + 8);
    }
    ctx.putImageData(imgData, x, y);
}

function showPreview() {
    const dataURL = canvas.toDataURL('image/png');
    previewImage.src = dataURL;
    btnDownload.href = dataURL;
    previewModal.style.display = 'flex';
}

if (btnCopyCaption) {
    btnCopyCaption.addEventListener('click', () => {
        const captionText = "V_WIPEX! 💚 Ensino • Pesquisa • Extensão\n#ifpr.oficial #ifprpinhaisoficial #V_WIPEX";
        navigator.clipboard.writeText(captionText).then(() => {
            btnCopyCaption.textContent = '✅ Legenda Copiada!';
            setTimeout(() => btnCopyCaption.textContent = '📋 Copiar Legenda', 2000);
        });
    });
}

if (bntCloseModal) {
    bntCloseModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });
}
