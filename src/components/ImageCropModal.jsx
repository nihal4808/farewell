import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';

const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
});

const getCroppedDataUrl = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const cropW = Math.max(1, Math.round(pixelCrop.width));
    const cropH = Math.max(1, Math.round(pixelCrop.height));

    // Cap output size to avoid mobile memory spikes / black canvas.
    const MAX_OUTPUT_EDGE = 1080;
    const scale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(cropW, cropH));
    const outW = Math.max(1, Math.round(cropW * scale));
    const outH = Math.max(1, Math.round(cropH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        cropW,
        cropH,
        0,
        0,
        outW,
        outH
    );

    return canvas.toDataURL('image/jpeg', 0.76);
};

export default function ImageCropModal({
    open,
    imageSrc,
    aspect = 1,
    title = 'Crop Photo',
    onCancel,
    onDone
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [saving, setSaving] = useState(false);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleDone = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setSaving(true);
        try {
            const cropped = await getCroppedDataUrl(imageSrc, croppedAreaPixels);
            onDone?.(cropped);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{title}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Adjust the framing, then click Apply Crop.
                        </p>

                        <div className="crop-modal-body">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={false}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.01}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleDone} disabled={saving}>
                                {saving ? 'Applying...' : 'Apply Crop'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
