document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam');
    const userImage = document.getElementById('user-image');
    const permissionScreen = document.getElementById('permission-screen');
    const btnGrantPermission = document.getElementById('btn-grant-permission');
    const btnCapture = document.getElementById('btn-capture');
    const btnSwitch = document.getElementById('btn-switch');
    const uploadPhoto = document.getElementById('upload-photo');
    const btnCustomize = document.getElementById('btn-customize');
    const stickersModal = document.getElementById('stickers-modal');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const btnClearStickers = document.getElementById('btn-clear-stickers');
    const stickersContainer = document.getElementById('stickers-container');
    const canvas = document.getElementById('export-canvas');
    const previewModal = document.getElementById('preview-modal');
    const previewImage = document.getElementById('preview-image');
    const btnDownload = document.getElementById('btn-download');
    const btnEditPhoto = document.getElementById('btn-edit-photo');
    const btnCloseModal = document.getElementById('btn-close-modal');

    let currentStream = null;
    let facingMode = 'user';
    let isUsingUserImage = false;

    // Mapeamento dos caminhos dos adesivos
    const stickerPaths = {
        atomo: 'adesivos/atomo.png',
        audio: 'adesivos/audio1.png',
        caderno: 'adesivos/caderno1.png',
        calend1: 'adesivos/calend1.png',
        capelo1: 'adesivos/capelo 1.png',
        capelo2: 'adesivos/capelo 2.png',
        capelo3: 'adesivos/capelo3.png',
        confetes: 'adesivos/confetes.1.png',
        coracao1: 'adesivos/coracao1.png',
        coracoes: 'adesivos/coracoes.png',
        emoji: 'adesivos/emoji1.png',
        fflor: 'adesivos/fflor1.png',
        fogos: 'adesivos/fogos_1.png',
        foguete2: 'adesivos/foguete 2.png',
        foguete1: 'adesivos/foguete.1.png',
        game1: 'adesivos/game1.png',
        ideias: 'adesivos/ideias1.png',
        ifpr: 'adesivos/ifpr.png',
        lamp: 'adesivos/lamp.png',
        lampflor: 'adesivos/lamp.flor1.png',
        lapiseira: 'adesivos/lapiseira1.png',
        llivro: 'adesivos/llivro 1.png',
        livros: 'adesivos/livros.png',
        lupa: 'adesivos/lupa1.png',
        mold1: 'adesivos/mold1.png',
        ok: 'adesivos/ok.png',
        pc1: 'adesivos/pc1.png',
        pc2: 'adesivos/pc2.png',
        relogio: 'adesivos/relogio.png',
        robo: 'adesivos/robo1.png',
        robo2: 'adesivos/robo2.png',
        robo3: 'adesivos/robo3.png',
        seta: 'adesivos/seta1.png',
        wifi: 'adesivos/wifi1.png'
    };

    // Inicialização do evento do botão de permissão
    if (btnGrantPermission) {
        btnGrantPermission.addEventListener('click', () => {
            initCamera();
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
                    width: { ideal: 1080 },
                    height: { ideal: 1920 }
                },
                audio: false
            };

            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = currentStream;
            await video.play();
            
            userImage.style.display = 'none';
            video.style.display = 'block';
            isUsingUserImage = false;

            if (permissionScreen) {
                permissionScreen.style.display = 'none';
            }
        } catch (err) {
            console.error('Erro ao aceder à câmara:', err);
            alert('Não foi possível aceder à câmara. Pode usar a Galeria para carregar uma foto!');
            if (permissionScreen) {
                permissionScreen.style.display = 'none';
            }
        }
    }

    if (btnSwitch) {
        btnSwitch.addEventListener('click', () => {
            facingMode = (facingMode === 'user') ? 'environment' : 'user';
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
                    if (permissionScreen) {
                        permissionScreen.style.display = 'none';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Modal da Gaveta de Adesivos
    if (btnCustomize) {
        btnCustomize.addEventListener('click', () => {
            stickersModal.style.display = 'flex';
        });
    }

    if (btnCloseDrawer) {
        btnCloseDrawer.addEventListener('click', () => {
            stickersModal.style.display = 'none';
        });
    }

    // Adicionar Adesivo ao Ecrã
    const stickerCards = document.querySelectorAll('.sticker-card');
    stickerCards.forEach(card => {
        card.addEventListener('click', () => {
            const stickerKey = card.getAttribute('data-sticker');
            if (stickerPaths[stickerKey]) {
                addStickerToCanvas(stickerPaths[stickerKey]);
                stickersModal.style.display = 'none';
            }
        });
    });

    function addStickerToCanvas(src) {
        const wrapper = document.createElement('div');
        wrapper.className = 'draggable-sticker';
        
        const img = document.createElement('img');
        img.src = src;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'sticker-delete-btn';
        deleteBtn.innerText = '✕';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.remove();
        });

        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
        stickersContainer.appendChild(wrapper);

        // Posiciona no centro
        wrapper.style.left = '50%';
        wrapper.style.top = '50%';
        wrapper.style.transform = 'translate(-50%, -50%) scale(1)';

        makeElementDraggableAndScalable(wrapper);
    }

    if (btnClearStickers) {
        btnClearStickers.addEventListener('click', () => {
            stickersContainer.innerHTML = '';
            stickersModal.style.display = 'none';
        });
    }

    // Gestos de Arrastar e Zoom/Pinça em Touch
    function makeElementDraggableAndScalable(el) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;
        let currentScale = 1;
        let initialPinchDistance = null;

        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);

        function handleTouchStart(e) {
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                const rect = el.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
            } else if (e.touches.length === 2) {
                isDragging = false;
                initialPinchDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        }

        function handleTouchMove(e) {
            e.preventDefault();
            if (isDragging && e.touches.length === 1) {
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                const viewportRect = document.getElementById('viewport').getBoundingClientRect();
                
                let newLeft = initialLeft + dx - viewportRect.left;
                let newTop = initialTop + dy - viewportRect.top;

                el.style.left = `${newLeft}px`;
                el.style.top = `${newTop}px`;
                el.style.transform = `scale(${currentScale})`;
            } else if (e.touches.length === 2 && initialPinchDistance) {
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const scaleFactor = currentDistance / initialPinchDistance;
                currentScale = Math.min(Math.max(0.5, currentScale * scaleFactor), 3.0);
                initialPinchDistance = currentDistance;
                el.style.transform = `scale(${currentScale})`;
            }
        }

        function handleTouchEnd(e) {
            if (e.touches.length < 2) {
                initialPinchDistance = null;
            }
            if (e.touches.length === 0) {
                isDragging = false;
            }
        }
    }

    // Desenhar Imagem com Proporção "Cover"
    function drawCover(ctx, img, targetWidth, targetHeight) {
        let nw = img.naturalWidth || img.videoWidth;
        let nh = img.naturalHeight || img.videoHeight;
        if (!nw || !nh) return;

        let aspect = nw / nh;
        let targetAspect = targetWidth / targetHeight;

        let dw, dh, dx, dy;
        if (aspect > targetAspect) {
            dh = targetHeight;
            dw = targetHeight * aspect;
            dx = (targetWidth - dw) / 2;
            dy = 0;
        } else {
            dw = targetWidth;
            dh = targetWidth / aspect;
            dx = 0;
            dy = (targetHeight - dh) / 2;
        }

        ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Filtro Suave de Pele
    function applySnapchatSkinFilter(ctx, width, height) {
        ctx.save();
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(255, 235, 220, 0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    // Tirar Foto e Renderizar no Canvas mantendo a posição e tamanho 100% idênticos
    if (btnCapture) {
        btnCapture.addEventListener('click', async () => {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            canvas.width = 1080;
            canvas.height = 1920;

            const sourceEl = isUsingUserImage ? userImage : video;
            
            drawCover(ctx, sourceEl, 1080, 1920);
            applySnapchatSkinFilter(ctx, 1080, 1920);

            // Moldura Superior (Branco Opaco Perfeito)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1080, 180);

            ctx.fillStyle = '#16a34a';
            ctx.font = '900 62px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('IFPR PINHAIS', 540, 110);

            ctx.fillStyle = '#475569';
            ctx.font = '700 28px Inter, sans-serif';
            ctx.fillText('CAMPUS PINHAIS', 540, 155);

            // Moldura Inferior (Garantindo o Branco Sólido e Opaco)
            ctx.fillStyle = '#ffffff';
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

            // MAPEAMENTO EXATO DE POSIÇÃO E TAMANHO DOS ADESIVOS
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

    function showPreview() {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        previewImage.src = dataUrl;
        previewModal.style.display = 'flex';
    }

    if (btnEditPhoto) {
        btnEditPhoto.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            stickersContainer.innerHTML = '';
            previewModal.style.display = 'none';
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', async () => {
            canvas.toBlob(async (blob) => {
                const file = new File([blob], 'polaroid-v-wipex.jpg', { type: 'image/jpeg' });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Foto V_WIPEX IFPR',
                            text: 'Minha foto na V_WIPEX IFPR Pinhais! 💚 #ifpr.oficial #ifprpinhaisoficial #V_WIPEX'
                        });
                    } catch (err) {
                        console.log('Partilha cancelada.');
                    }
                } else {
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL('image/jpeg', 0.95);
                    a.download = 'polaroid-v-wipex.jpg';
                    a.click();
                }
            }, 'image/jpeg', 0.95);
        });
    }
});
