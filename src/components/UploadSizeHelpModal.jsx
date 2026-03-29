import { AnimatePresence, motion } from 'framer-motion';

export default function UploadSizeHelpModal({
    open,
    onClose,
    onGoToSite,
    siteUrl
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.94, y: 16 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.94, y: 16 }}
                        transition={{ type: 'spring', damping: 24 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: 460 }}
                    >
                        <h3 style={{ marginBottom: '0.55rem', fontSize: '1.05rem' }}>Photo Is Too Large</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Please compress the image to under 10 MB and upload again.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.6rem', wordBreak: 'break-all' }}>
                            {siteUrl}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.15rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={onClose}>OK</button>
                            <button className="btn btn-primary btn-sm" onClick={onGoToSite}>Go To Site</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}