// Referencias Elementos DOM
const video = document.getElementById('webcam');
const userImage = document.getElementById('user-image');
const svgFrame = document.getElementById('svg-frame');
const customFrameImg = document.getElementById('custom-frame-img');
const canvas = document.getElementById('export-canvas');

const btnCapture = document.getElementById('btn-capture');
const btnSwitch = document.getElementById('btn-switch');
const uploadPhoto = document.getElementById('upload-photo');
const uploadFrame = document.getElementById('upload-frame');

const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const btnDownload = document.getElementById('btn-download');
const btnCloseModal = document.getElementById('btn-close-modal');

// Variaveis Estado Camera
let currentStream = null;
let facingMode = 'user';
let isUsingUserImage = false;

// Inicializacao
window.addEventListener('DOMContentLoaded', () => {
    initCamera();
});

// Inicializar Camera
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
    } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        alert('Não foi possível acessar a câmera. Tente usar uma foto da galeria.');
    }
}

// Inverter Camera Frontal Traseira
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

            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
        reader.readAsDataURL(file);
    }
});

// Upload Moldura Customizada PNG
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

    // Desenhar Fundo Foto ou Video
    if (isUsingUserImage) {
        drawCoverImage(ctx, userImage, 1080, 1920);
        processOverlayAndExport(ctx);
    } else {
        drawCoverVideo(ctx, video, 1080, 1920);
        processOverlayAndExport(ctx);
    }
});

// Ajustar Proporcao Video Canvas
function drawCoverVideo(ctx, img, targetWidth, targetHeight) {
    const videoWidth = img.videoWidth || targetWidth;
    const videoHeight = img.videoHeight || targetHeight;

    const targetRatio = targetWidth / targetHeight;
    const imgRatio = videoWidth / videoHeight;

    let sw, sh, sx, sy;

    if (imgRatio > targetRatio) {
        sh = videoHeight;
        sw = videoHeight * targetRatio;
        sx = (videoWidth - sw) / 2;
        sy = 0;
    } else {
        sw = videoWidth;
        sh = videoWidth / targetRatio;
        sx = 0;
        sy = (videoHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
}

// Ajustar Proporcao Imagem Canvas
function drawCoverImage(ctx, img, targetWidth, targetHeight) {
    const imgWidth = img.naturalWidth || targetWidth;
    const imgHeight = img.naturalHeight || targetHeight;

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

// Processar Overlay SVG ou PNG Customizado
function processOverlayAndExport(ctx) {
    if (customFrameImg.style.display !== 'none' && customFrameImg.src) {
        ctx.drawImage(customFrameImg, 0, 0, 1080, 1920);
        showPreview();
    } else {
        const svgElement = svgFrame.querySelector('svg');
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

// Exibir Modal Previa
function showPreview() {
    const dataURL = canvas.toDataURL('image/png');
    previewImage.src = dataURL;
    btnDownload.href = dataURL;
    previewModal.style.display = 'flex';
}

// Fechar Modal
btnCloseModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
    if (!isUsingUserImage && !currentStream) {
        initCamera();
    }
});
