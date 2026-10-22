// Variáveis Globais daAplicação
let webcamStream = null;
let useFrontCamera = true;
let isUserImageLoaded = false;
let userImage = new Image();

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
        stickerDiv.remove();
    });

    stickerDiv.appendChild(img);
    stickerDiv.appendChild(deleteBtn);
    stickersContainer.appendChild(stickerDiv);

    initStickerInteractions(stickerDiv);
}

// Limpar Todos os Adesivos
btnClearStickers.addEventListener('click', () => {
    stickersContainer.innerHTML = '';
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

// 6. Captura e Renderização Final no Canvas (1080x1920)
btnCapture.addEventListener('click', () => {
    const canvas = document.getElementById('export-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Limpar e pintar o fundo de branco opaco total
    ctx.clearRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, 1920);

    const headerHeight = 140;
    const footerHeight = 240;
    const windowHeight = 1920 - headerHeight - footerHeight;

    // Desenhar feed da câmara ou imagem carregada na janela central
    const source = isUserImageLoaded ? userImage : webcam;
    if (source && (source.videoWidth || isUserImageLoaded)) {
        ctx.drawImage(source, 0, headerHeight, 1080, windowHeight);
    }

    // Desenhar Cabeçalho Polaroid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, headerHeight);
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IFPR PINHAIS', 540, 75);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('CAMPUS PINHAIS', 540, 110);

    // Desenhar Rodapé Polaroid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 1920 - footerHeight, 1080, footerHeight);
    ctx.fillStyle = '#16a34a';
    ctx.font = '900 52px Inter, sans-serif';
    ctx.fillText('V_WIPEX! 💚', 540, 1920 - footerHeight + 80);
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('Ensino • Pesquisa • Extensão', 540, 1920 - footerHeight + 130);
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('#ifpr.oficial  #ifprpinhaisoficial  #V_WIPEX', 540, 1920 - footerHeight + 180);

    // Desenhar Adesivos no Canvas com proporção exata
    const viewportRect = document.getElementById('viewport').getBoundingClientRect();
    const scaleX = 1080 / viewportRect.width;
    const scaleY = 1920 / viewportRect.height;

    document.querySelectorAll('.draggable-sticker').forEach(stickerEl => {
        const img = stickerEl.querySelector('img');
        if (!img) return;

        const rect = stickerEl.getBoundingClientRect();
        const x = (rect.left - viewportRect.left) * scaleX;
        const y = (rect.top - viewportRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;

        ctx.drawImage(img, x, y, width, height);
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
});
