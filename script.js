// Tirar Foto e Renderizar no Canvas mantendo a posição e tamanho 100% idênticos
if (btnCapture) {
    btnCapture.addEventListener('click', async () => {
        const ctx = canvas.getContext('2d');
        canvas.width = 1080;
        canvas.height = 1920;

        const sourceEl = isUsingUserImage ? userImage : video;
        
        drawCover(ctx, sourceEl, 1080, 1920);
        applySnapchatSkinFilter(ctx, 1080, 1920);

        // Moldura Superior (Mantém exatamente como está no seu design original)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1080, 180);

        ctx.fillStyle = '#16a34a';
        ctx.font = '900 62px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('IFPR PINHAIS', 540, 110);

        ctx.fillStyle = '#475569';
        ctx.font = '700 28px Inter, sans-serif';
        ctx.fillText('CAMPUS PINHAIS', 540, 155);

        // Moldura Inferior (Mantém exatamente como está no seu design original)
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
        
        // Fator de escala exato entre a tela e o canvas 1080x1920
        const scaleX = 1080 / viewRect.width;
        const scaleY = 1920 / viewRect.height;
        
        for (const stickerEl of activeStickers) {
            const imgEl = stickerEl.querySelector('img');
            const rect = stickerEl.getBoundingClientRect();
            
            if (imgEl && imgEl.complete && imgEl.naturalWidth !== 0) {
                // Calcula o centro exato do adesivo em relação à área da câmara
                const centerX = (rect.left - viewRect.left + rect.width / 2) * scaleX;
                const centerY = (rect.top - viewRect.top + rect.height / 2) * scaleY;
                
                ctx.save();
                ctx.translate(centerX, centerY);
                
                // Lê o fator de zoom/pinça aplicado pelo usuário no ecrã
                const transformMatrix = window.getComputedStyle(stickerEl).transform;
                let userScale = 1;
                if (transformMatrix && transformMatrix !== 'none') {
                    const values = transformMatrix.split('(')[1].split(')')[0].split(',');
                    const a = parseFloat(values[0]);
                    const b = parseFloat(values[1]);
                    userScale = Math.sqrt(a * a + b * b);
                }
                
                // Tamanho base do adesivo no canvas proporcional ao CSS (120px)
                const baseDisplaySize = 120; 
                const finalSize = baseDisplaySize * userScale * scaleX;
                
                ctx.drawImage(imgEl, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
                ctx.restore();
            }
        }

        showPreview();
    });
}
