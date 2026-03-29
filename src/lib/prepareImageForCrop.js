const fallbackReadAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const loadImageFromUrl = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
});

const estimateDataUrlBytes = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') return 0;
    const idx = dataUrl.indexOf(',');
    if (idx === -1) return 0;
    const base64 = dataUrl.slice(idx + 1);
    const padding = base64.endsWith('==') ? 2 : (base64.endsWith('=') ? 1 : 0);
    return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};

const drawResizedToCanvas = (image, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
        throw new Error('Canvas context unavailable');
    }
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
};

const canvasToJpegWithinLimit = (canvas, {
    maxBytes = 850 * 1024,
    initialQuality = 0.92,
    minQuality = 0.6,
    minEdge = 800
} = {}) => {
    let current = canvas;
    let attempt = 0;

    while (attempt < 6) {
        let quality = initialQuality;
        let out = current.toDataURL('image/jpeg', quality);

        while (estimateDataUrlBytes(out) > maxBytes && quality > minQuality) {
            quality = Math.max(minQuality, quality - 0.08);
            out = current.toDataURL('image/jpeg', quality);
        }

        if (estimateDataUrlBytes(out) <= maxBytes) {
            return out;
        }

        const nextW = Math.floor(current.width * 0.86);
        const nextH = Math.floor(current.height * 0.86);
        if (Math.max(nextW, nextH) < minEdge) {
            return out;
        }

        const down = document.createElement('canvas');
        down.width = nextW;
        down.height = nextH;
        const dctx = down.getContext('2d', { alpha: false });
        if (!dctx) {
            return out;
        }
        dctx.drawImage(current, 0, 0, nextW, nextH);
        current = down;
        attempt += 1;
    }

    return current.toDataURL('image/jpeg', minQuality);
};

const resizeFromUrl = async (url, maxDimension = 1280, quality = 0.85) => {
    const image = await loadImageFromUrl(url);
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;

    if (!srcW || !srcH) {
        throw new Error('Invalid image size');
    }

    const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = drawResizedToCanvas(image, width, height);
    return canvasToJpegWithinLimit(canvas, {
        maxBytes: 800 * 1024,
        initialQuality: quality,
        minQuality: 0.55,
        minEdge: 800
    });
};

export const isLowMemoryDevice = () => {
    if (typeof navigator === 'undefined') return false;

    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    const isLikelyMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

    if (memory > 0 && memory <= 4) return true;
    if (isLikelyMobile && cores > 0 && cores <= 4) return true;

    return false;
};

const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
};

export async function prepareImageForCrop(file, maxDimension = 1600, quality = 0.9) {
    if (!file) return '';

    // Keep very small files untouched for speed.
    if (file.size < 900 * 1024) {
        return fallbackReadAsDataUrl(file);
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await loadImageFromUrl(objectUrl);
        const srcW = image.naturalWidth || image.width;
        const srcH = image.naturalHeight || image.height;

        if (!srcW || !srcH) {
            throw new Error('Invalid image size');
        }

        const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
        const width = Math.max(1, Math.round(srcW * scale));
        const height = Math.max(1, Math.round(srcH * scale));

        const canvas = drawResizedToCanvas(image, width, height);
        return canvasToJpegWithinLimit(canvas, {
            maxBytes: 850 * 1024,
            initialQuality: quality,
            minQuality: 0.6,
            minEdge: 850
        });
    } catch (error) {
        console.warn('Image preprocessing failed, using direct read.', error.message);
        return fallbackReadAsDataUrl(file);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function preparePickedImage(file, options = {}) {
    if (!file) return { source: '', skipInteractiveCrop: false };

    const {
        lowMemoryMaxDimension = 1280,
        lowMemoryQuality = 0.84,
        defaultMaxDimension = 1600,
        defaultQuality = 0.88,
        mobileSafeThresholdBytes = 1200 * 1024
    } = options;

    const lowMemory = isLowMemoryDevice();
    const mobileLargeFile = isMobileDevice() && file.size >= mobileSafeThresholdBytes;
    const forceSafeMode = lowMemory || mobileLargeFile;

    if (!forceSafeMode) {
        const source = await prepareImageForCrop(file, defaultMaxDimension, defaultQuality);
        return { source, skipInteractiveCrop: false };
    }

    const objectUrl = URL.createObjectURL(file);
    try {
        const resized = await resizeFromUrl(objectUrl, lowMemoryMaxDimension, lowMemoryQuality);
        return {
            source: resized,
            finalImage: resized,
            skipInteractiveCrop: true,
            safeMode: lowMemory ? 'low-memory' : 'mobile-large-file'
        };
    } catch (error) {
        console.warn('Low-memory safe mode resize failed, falling back to direct preprocessing.', error.message);
        const fallbackSource = await fallbackReadAsDataUrl(file);
        return {
            source: fallbackSource,
            finalImage: fallbackSource,
            skipInteractiveCrop: true,
            safeMode: 'fallback-no-crop'
        };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}