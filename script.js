// Variáveis Globais daAplicação
let webcamStream = null;
let useFrontCamera = true;
let isUserImageLoaded = false;
let userImage = new Image();
let placedStickers = [];

const webcam = document.getElementById('webcam');
const userImageElement = document.getElementById('user-image');
const permissionScreen = document.getElementById('permission-screen');
const btnGrantPermission = document.getElementById('btn-grant-permission');
const btnCapture = document.getElementById('btn-capture');
const btnSwitch = document.getElementById('btn-switch');
const uploadPhoto = document.getElementById('upload-photo');
const btnCustomize = document.getElementById('btn-customize');
const stickersModal = document.getElementById('stickers-modal');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const btnClearStickers = document.getElementById('btn-clear-stickers');
const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const btnDownload = document.getElementById('btn-download');
const btnEditPhoto = document.getElementById('btn-edit-photo');
const btnCloseModal = document.getElementById('btn-close-modal');
const stickersContainer = document.getElementById('stickers-container');
const viewport = document.getElementById('viewport');
const polaroidFrame = document.getElementById('polaroid-frame');

// 1. Gestão de Permissão e Inicialização da Câmara
btnGrantPermission.addEventListener('click', async () => {
    try {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        webcamStream = await navigator.mediaDevices.getUserMedia(constraints);
        webcam.srcObject = webcamStream;
        await webcam.play();

        // Esconde o ecrã de permissão inicial com suavidade
        permissionScreen.style.opacity = '0';
        setTimeout(() => {
            permissionScreen.style.display = 'none';
        }, 300);

    } catch (err) {
        console.error("Erro ao aceder à câmara:", err);
        alert("Não foi possível aceder à câmara. Verifique as permissões do navegador.");
    }
});

// 2. Inverter Câmara (Frontal / Traseira)
btnSwitch.addEventListener('click', async () => {
    useFrontCamera = !useFrontCamera;
    if (permissionScreen.style.display === 'none') {
        btnGrantPermission.click();
    }
});

// 3. Upload de Foto da Galeria
uploadPhoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            userImage.src = event.target.result;
            userImage.onload = function() {
                userImageElement.src = userImage.src;
                userImageElement.style.display = 'block';
                webcam.style.display = 'none';
                isUserImageLoaded = true;
            }
        }
        reader.readAsDataURL(file);
    }
});

// 4. Gaveta de Adesivos (Modal)
btnCustomize.addEventListener('click', () => {
    stickersModal.style.display = 'flex';
});

btnCloseDrawer.addEventListener('click', () => {
    stickersModal.style.display = 'none';
});

// Adicionar Adesivo ao Ecrã
document.querySelectorAll('.sticker-card').forEach(card => {
    card.addEventListener('click', () => {
        const stickerName = card.getAttribute('data-sticker');
        const imgPath = card.querySelector('img').getAttribute('src');
        createStickerElement(imgPath);
        stickersModal.style.display = 'none';
    });
});

function createStickerElement(src) {
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'draggable-sticker';
    stickerDiv.style.left = '50%';
    stickerDiv.style.top = '50%';
    stickerDiv.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Adesivo';

    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'sticker-delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        placedStickers = placedStickers.filter(sticker => sticker !== stickerDiv);
        stickerDiv.remove();
    });

    stickerDiv.appendChild(img);
    stickerDiv.appendChild(deleteBtn);
    stickersContainer.appendChild(stickerDiv);
    placedStickers.push(stickerDiv);

    initStickerInteractions(stickerDiv);
}

function clearPlacedStickers() {
    stickersContainer.innerHTML = '';
    placedStickers = [];
}

// Limpar Todos os Adesivos
btnClearStickers.addEventListener('click', () => {
    clearPlacedStickers();
    stickersModal.style.display = 'none';
});

// 5. Interatividade Tátil (Arrastar, Zoom com Pinça e Rotação)
function initStickerInteractions(el) {
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;
    let xOffset = 0;
    let yOffset = 0;
    let scale = 1;
    let rotation = 0;

    let initialDistance = 0;
    let initialAngle = 0;

    el.dataset.offsetX = '0';
    el.dataset.offsetY = '0';
    el.dataset.scale = '1';
    el.dataset.rotation = '0';

    el.addEventListener('pointerdown', dragStart, { passive: false });

    function dragStart(e) {
        if (e.target.classList.contains('sticker-delete-btn')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.pointerType === 'touch') {
            // Registo para multi-touch (pinça/rotação)
            document.addEventListener('pointermove', pointerMove, { passive: false });
            document.addEventListener('pointerup', dragEnd);
        } else {
            window.addEventListener('pointermove', pointerMove);
            window.addEventListener('pointerup', dragEnd);
        }
    }

    function pointerMove(e) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;

        setTransform();
    }

    function dragEnd() {
        window.removeEventListener('pointermove', pointerMove);
        window.removeEventListener('pointerup', dragEnd);
        document.removeEventListener('pointermove', pointerMove);
        document.removeEventListener('pointerup', dragEnd);
    }

    function setTransform() {
        el.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${scale}) rotate(${rotation}deg)`;
        el.dataset.offsetX = String(currentX);
        el.dataset.offsetY = String(currentY);
        el.dataset.scale = String(scale);
        el.dataset.rotation = String(rotation);
    }

    // Suporte a Pinch-to-Zoom e Rotação por toque duplo / gestos
    el.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialAngle = Math.atan2(
                e.touches[1].clientY - e.touches[0].clientY,
                e.touches[1].clientX - e.touches[0].clientX
            ) * (180 / Math.PI);
        }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const currentAngle = Math.atan2(
                e.touches[1].clientY - e.touches[0].clientY,
                e.touches[1].clientX - e.touches[0].clientX
            ) * (180 / Math.PI);

            scale = Math.max(0.5, Math.min(3, scale * (currentDistance / initialDistance)));
            rotation += currentAngle - initialAngle;

            initialDistance = currentDistance;
            initialAngle = currentAngle;

            setTransform();
        }
    }, { passive: true });
}

function getPolaroidMetrics(canvasWidth, canvasHeight) {
    const viewportRect = viewport.getBoundingClientRect();
    const header = polaroidFrame.querySelector('.polaroid-header');
    const windowEl = polaroidFrame.querySelector('.polaroid-window');
    const footer = polaroidFrame.querySelector('.polaroid-footer');

    if (!viewportRect.width || !viewportRect.height || !header || !windowEl || !footer) {
        return {
            windowX: 0,
            windowY: 140,
            windowWidth: canvasWidth,
            windowHeight: canvasHeight - 380,
            headerHeight: 140,
            footerTop: canvasHeight - 240,
            footerHeight: 240
        };
    }

    const headerRect = header.getBoundingClientRect();
    const windowRect = windowEl.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    const mapX = value => ((value - viewportRect.left) / viewportRect.width) * canvasWidth;
    const mapY = value => ((value - viewportRect.top) / viewportRect.height) * canvasHeight;

    const windowX = mapX(windowRect.left);
    const windowY = mapY(windowRect.top);
    const windowWidth = mapX(windowRect.right) - windowX;
    const windowHeight = mapY(windowRect.bottom) - windowY;
    const headerHeight = mapY(headerRect.bottom) - mapY(headerRect.top);
    const footerTop = mapY(footerRect.top);
    const footerHeight = mapY(footerRect.bottom) - footerTop;

    return { windowX, windowY, windowWidth, windowHeight, headerHeight, footerTop, footerHeight };
}

function drawSourceContain(ctx, source, x, y, width, height) {
    const sourceWidth = source.videoWidth || source.naturalWidth || source.width;
    const sourceHeight = source.videoHeight || source.naturalHeight || source.height;

    if (!sourceWidth || !sourceHeight) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);

    const scale = Math.min(width / sourceWidth, height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
}

// 6. Captura e Renderização Final no Canvas (1080x1920)
btnCapture.addEventListener('click', () => {
    const canvas = document.getElementById('export-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const viewportRect = viewport.getBoundingClientRect();
    const metrics = getPolaroidMetrics(canvasWidth, canvasHeight);
    const footerTop = metrics.footerTop;
    const footerHeight = metrics.footerHeight;

    // Limpar e pintar o fundo de branco opaco total
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Desenhar feed da câmara ou imagem carregada na janela central
    const source = isUserImageLoaded ? userImage : webcam;
    if (source && (source.videoWidth || isUserImageLoaded)) {
        drawSourceContain(ctx, source, metrics.windowX, metrics.windowY, metrics.windowWidth, metrics.windowHeight);
    }

    // Reforçar áreas brancas sólidas da moldura (topo e base)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, metrics.windowY);
    ctx.fillRect(0, footerTop, canvasWidth, canvasHeight - footerTop);

    // Contorno da janela da polaroid (igual à edição)
    const borderSize = Math.max(2, Math.round(canvasWidth * 0.0018));
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = borderSize;
    ctx.strokeRect(
        metrics.windowX + borderSize / 2,
        metrics.windowY + borderSize / 2,
        metrics.windowWidth - borderSize,
        metrics.windowHeight - borderSize
    );

    // Desenhar Cabeçalho Polaroid
    ctx.fillStyle = '#16a34a';
    ctx.font = `900 ${Math.max(24, Math.round(metrics.headerHeight * 0.3))}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('IFPR PINHAIS', canvasWidth / 2, Math.max(30, metrics.headerHeight * 0.55));
    ctx.fillStyle = '#475569';
    ctx.font = `700 ${Math.max(14, Math.round(metrics.headerHeight * 0.16))}px Inter, sans-serif`;
    ctx.fillText('CAMPUS PINHAIS', canvasWidth / 2, Math.max(54, metrics.headerHeight * 0.8));

    // Desenhar Rodapé Polaroid
    ctx.fillStyle = '#16a34a';
    ctx.font = `900 ${Math.max(30, Math.round(footerHeight * 0.22))}px Inter, sans-serif`;
    ctx.fillText('V_WIPEX! 💚', canvasWidth / 2, footerTop + footerHeight * 0.33);
    ctx.fillStyle = '#334155';
    ctx.font = `700 ${Math.max(18, Math.round(footerHeight * 0.12))}px Inter, sans-serif`;
    ctx.fillText('Ensino • Pesquisa • Extensão', canvasWidth / 2, footerTop + footerHeight * 0.54);
    ctx.fillStyle = '#e11d48';
    ctx.font = `700 ${Math.max(14, Math.round(footerHeight * 0.1))}px Inter, sans-serif`;
    ctx.fillText('#ifpr.oficial  #ifprpinhaisoficial  #V_WIPEX', canvasWidth / 2, footerTop + footerHeight * 0.75);

    // Desenhar Adesivos no Canvas mantendo posição, escala e rotação da edição
    const scaleX = canvasWidth / viewportRect.width;
    const scaleY = canvasHeight / viewportRect.height;

    placedStickers = placedStickers.filter(stickerEl => stickerEl.isConnected);
    placedStickers.forEach(stickerEl => {
        const img = stickerEl.querySelector('img');
        if (!img) return;

        const offsetX = Number.parseFloat(stickerEl.dataset.offsetX || '0');
        const offsetY = Number.parseFloat(stickerEl.dataset.offsetY || '0');
        const stickerScale = Number.parseFloat(stickerEl.dataset.scale || '1');
        const stickerRotation = Number.parseFloat(stickerEl.dataset.rotation || '0') * (Math.PI / 180);

        const centerX = canvasWidth / 2 + (offsetX * scaleX);
        const centerY = canvasHeight / 2 + (offsetY * scaleY);
        const baseWidth = img.clientWidth * scaleX;
        const baseHeight = img.clientHeight * scaleY;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(stickerRotation);
        ctx.scale(stickerScale, stickerScale);
        ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
        ctx.restore();
    });

    // Exibir Pré-visualização
    previewImage.src = canvas.toDataURL('image/png');
    previewModal.style.display = 'flex';
});

// 7. Ações do Modal de Pré-visualização
btnDownload.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'V_WIPEX_IFPR.png';
    link.href = document.getElementById('export-canvas').toDataURL('image/png');
    link.click();
});

btnEditPhoto.addEventListener('click', () => {
    previewModal.style.display = 'none'; // Fecha o modal mantendo todos os adesivos intactos
});

btnCloseModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
    isUserImageLoaded = false;
    userImageElement.style.display = 'none';
    webcam.style.display = 'block';
    clearPlacedStickers();
});
