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
const btnEditPhoto = document.getElementById('btn-edit-photo');
const bntCloseModal = document.getElementById('btn-close-modal');

let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;

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

stickerCards.forEach(card => {
    card.addEventListener('click', () => {
        const imgEl = card.querySelector('img');
        if (imgEl && imgEl.src) {
            createStickerElement(imgEl.src);
        }
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'sticker-delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        div.remove();
    });
    div.appendChild(deleteBtn);
    
    let posX = window.innerWidth / 2 - 60;
    let posY = window.innerHeight / 2 - 60;
    let scale = 1;
    let rotation = 0;

    div.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;

    let initialPinchDistance = 0;
    let initialScale = 1;
    let isDragging = false;
    let startX, startY;

    div.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - posX;
            startY = e.touches[0].clientY - posY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialPinchDistance = getTouchDistance(e.touches);
            initialScale = scale;
        }
    }, { passive: false });

    div.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;
            updateTransform();
        } else if (e.touches.length === 2) {
            const currentDistance = getTouchDistance(e.touches);
            if (initialPinchDistance > 0) {
                scale = Math.min(Math.max(0.4, initialScale * (currentDistance / initialPinchDistance)), 4.0);
                updateTransform();
            }
        }
    }, { passive: false });

    div.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) initialPinchDistance = 0;
        if (e.touches.length === 0) isDragging = false;
    });

    div.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') {
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
            div.setPointerCapture(e.pointerId);
        }
    });

    div.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse' && isDragging) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateTransform();
        }
    });

    div.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') {
            isDragging = false;
            try { div.releasePointerCapture(e.pointerId); } catch(err){}
        }
    });

    function updateTransform() {
        div.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
    }

    stickersContainer.appendChild(div);
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

if (btnGrantPermission) {
    btnGrantPermission.addEventListener('click', async () => {
        const success = await initCamera();
        if (success) permissionScreen.style.display = 'none';
    });
}

async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());

    try {
        const constraints = {
            video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
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

                if (currentStream) currentStream.getTracks().forEach(track => track.stop());
            };
            reader.readAsDataURL(file);
        }
    });
}

// Tirar Foto e Renderizar no Canvas com mapeamento 1:1 rigoroso
if (btnCapture) {
    btnCapture.addEventListener('click', async () => {
        const ctx = canvas.getContext('2d');
        canvas.width = 1080;
        canvas.height = 1920;

        const sourceEl = isUsingUserImage ? userImage : video;
        
        drawCover(ctx, sourceEl, 1080, 1920);
        applySnapchatSkinFilter(ctx, 1080, 1920);

        // Moldura Superior (Seu design original exato)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1080, 180);

        ctx.fillStyle = '#16a34a';
        ctx.font = '900 62px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('IFPR PINHAIS', 540, 110);

        ctx.fillStyle = '#475569';
        ctx.font = '700 28px Inter, sans-serif';
        ctx.fillText('CAMPUS PINHAIS', 540, 155);

        // Moldura Inferior (Seu design original exato)
        ctx.fillRect(0, 1520, 1080, 400);

        ctx.fillStyle = '#16a34a';
        ctx.font = '900 72px Inter, sans-serif';
        ctx.fillText('V_WIPEX! 💚', 540, 1630);

        ctx.fillStyle = '#334155';
        ctx.font = '700 36px Inter, sans-serif';
        ctx.fillText('Ensino • Pesquisa • Extensão', 540, 1700);

        ctx.fillStyle = '#e11d48';
        ctx.font = '700 28px Inter, sans-serif';
        ctx.fillText('#ifpr.oficial #ifprpinhaisoficial #V_WIPEX', 540, 1760);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 6;
        ctx.strokeRect(0, 180, 1080, 1340);

        // Mapeamento preciso dos adesivos para o canvas 1080x1920
        const activeStickers = stickersContainer.querySelectorAll('.draggable-sticker');
        const viewportEl = document.getElementById('viewport');
        const viewRect = viewportEl.getBoundingClientRect();
        
        const scaleX = 1080 / viewRect.width;
        const scaleY = 1920 / viewRect.height;
        
        for (const stickerEl of activeStickers) {
            const imgEl = stickerEl.querySelector('img');
            const rect = stickerEl.getBoundingClientRect();
            
            if (imgEl && imgEl.complete && imgEl.naturalWidth !== 0) {
                const centerX = (rect.left - viewRect.left + rect.width / 2) * scaleX;
                const centerY = (rect.top - viewRect.top + rect.height / 2) * scaleY;
                
                ctx.save();
                ctx.translate(centerX, centerY);
                
                const transformMatrix = window.getComputedStyle(stickerEl).transform;
                let userScale = 1;
                if (transformMatrix && transformMatrix !== 'none') {
                    const values = transformMatrix.split('(')[1].split(')')[0].split(',');
                    const a = parseFloat(values[0]);
                    const b = parseFloat(values[1]);
                    userScale = Math.sqrt(a * a + b * b);
                }
                
                const baseDisplaySize = 120;
                const finalSize = baseDisplaySize * userScale * scaleX;
                
                ctx.drawImage(imgEl, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
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

function showPreview() {
    canvas.toBlob(async (blob) => {
        const file = new File([blob], "foto-v-wipex-ifpr.png", { type: "image/png" });
        const dataURL = URL.createObjectURL(blob);
        
        previewImage.src = dataURL;
        previewModal.style.display = 'flex';

        btnDownload.onclick = async () => {
            const captionText = "V_WIPEX! 💚 Ensino • Pesquisa • Extensão\n#ifpr.oficial #ifprpinhaisoficial #V_WIPEX";
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Foto #V_WIPEX - IFPR Pinhais',
                        text: captionText,
                        files: [file]
                    });
                    return;
                } catch (err) {
                    console.log('Partilha cancelada', err);
                }
            }
            
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'foto-v-wipex-ifpr.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    }, 'image/png');
}

// Botão "Editar Foto" fecha o modal e mantém os adesivos intactos
if (btnEditPhoto) {
    btnEditPhoto.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });
}

// Botão "Tirar Outra" limpa a tela e fecha o modal
if (bntCloseModal) {
    bntCloseModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
        stickersContainer.innerHTML = '';
    });
}
