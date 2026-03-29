const estimateDataUrlBytes = (value) => {
    if (!value || typeof value !== 'string' || !value.startsWith('data:image/')) return 0;
    const comma = value.indexOf(',');
    if (comma < 0) return 0;
    const b64 = value.slice(comma + 1);
    const padding = b64.endsWith('==') ? 2 : (b64.endsWith('=') ? 1 : 0);
    return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
};

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
});

const toCanvas = (image, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas context unavailable');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
};

export async function compressDataUrlToMaxBytes(dataUrl, maxBytes, options = {}) {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return dataUrl;
    }

    if (estimateDataUrlBytes(dataUrl) <= maxBytes) {
        return dataUrl;
    }

    const {
        initialMaxEdge = 1080,
        minEdge = 520,
        initialQuality = 0.8,
        minQuality = 0.42,
        resizeStep = 0.85,
        qualityStep = 0.08,
        maxPasses = 7
    } = options;

    const image = await loadImage(dataUrl);
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;
    const initialScale = Math.min(1, initialMaxEdge / Math.max(srcW, srcH));
    let width = Math.max(1, Math.round(srcW * initialScale));
    let height = Math.max(1, Math.round(srcH * initialScale));
    let canvas = toCanvas(image, width, height);

    for (let pass = 0; pass < maxPasses; pass += 1) {
        let quality = initialQuality;
        while (quality >= minQuality) {
            const out = canvas.toDataURL('image/jpeg', quality);
            if (estimateDataUrlBytes(out) <= maxBytes) {
                return out;
            }
            quality -= qualityStep;
        }

        const nextW = Math.max(1, Math.floor(width * resizeStep));
        const nextH = Math.max(1, Math.floor(height * resizeStep));
        if (Math.max(nextW, nextH) < minEdge) {
            break;
        }

        width = nextW;
        height = nextH;
        canvas = toCanvas(canvas, width, height);
    }

    return canvas.toDataURL('image/jpeg', minQuality);
}

export { estimateDataUrlBytes };