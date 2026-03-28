import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

const MOCK_MEMORIES = [
    { id: 'm1', photo_url: 'https://picsum.photos/seed/farewell1/600/450', caption: 'Our first day together — a journey begins.' },
    { id: 'm2', photo_url: 'https://picsum.photos/seed/farewell2/600/450', caption: 'Late-night study sessions and endless laughter.' },
    { id: 'm3', photo_url: 'https://picsum.photos/seed/farewell3/600/450', caption: 'Annual fest — We owned the stage!' },
    { id: 'm4', photo_url: 'https://picsum.photos/seed/farewell4/600/450', caption: 'Project expo — bringing ideas to life.' },
    { id: 'm5', photo_url: 'https://picsum.photos/seed/farewell5/600/450', caption: 'The farewell dinner — bittersweet goodbyes.' },
    { id: 'm6', photo_url: 'https://picsum.photos/seed/farewell6/600/450', caption: 'The team that made it all possible.' },
];

// Seeded random rotations so they look hand-pinned
const rotations = [-4, 3, -2, 5, -3, 2];
const offsets = [6, -4, 8, -6, 3, -8]; // slight Y jitter

export default function MemoryGallery() {
    const [selected, setSelected] = useState(null);

    const downloadPhoto = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'memory.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to simple link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'memory.jpg';
            link.target = '_blank';
            link.click();
        }
    };

    return (
        <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title font-display">Our Memories</h2>
                <p className="section-subtitle">Polaroids pinned to the wall of time</p>
            </div>

            {/* Polaroid Wall Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '2.5rem',
                padding: '1rem',
            }}>
                {MOCK_MEMORIES.map((m, i) => {
                    const rot = rotations[i % rotations.length];
                    const yOff = offsets[i % offsets.length];

                    return (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 60, rotate: rot * 2 }}
                            whileInView={{ opacity: 1, y: 0, rotate: rot }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 120, damping: 14 }}
                            whileHover={{ rotate: 0, scale: 1.05, y: -8, zIndex: 10 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelected(m)}
                            style={{
                                cursor: 'pointer',
                                position: 'relative',
                                marginTop: `${yOff}px`,
                                transformOrigin: 'center center',
                            }}
                        >
                            {/* Tape strip */}
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '50px',
                                height: '20px',
                                background: 'rgba(201, 168, 76, 0.25)',
                                borderRadius: '2px',
                                zIndex: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            }} />

                            {/* Polaroid frame */}
                            <div style={{
                                background: '#f5f0e8',
                                padding: '12px 12px 48px 12px',
                                borderRadius: '3px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
                                position: 'relative',
                            }}>
                                {/* Photo */}
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '4/3',
                                    overflow: 'hidden',
                                    borderRadius: '1px',
                                }}>
                                    <img
                                        src={m.photo_url}
                                        alt={m.caption}
                                        loading="lazy"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                    />
                                </div>

                                {/* Caption - handwritten style */}
                                <p style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '16px',
                                    right: '16px',
                                    fontFamily: "'Playfair Display', serif",
                                    fontStyle: 'italic',
                                    fontSize: '0.8rem',
                                    color: '#3a2e1c',
                                    lineHeight: 1.3,
                                    textAlign: 'center',
                                }}>
                                    {m.caption}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, rotate: -3 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.85, rotate: 3 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '550px', width: '100%' }}
                        >
                            {/* Big polaroid */}
                            <div style={{
                                background: '#f5f0e8',
                                padding: '16px 16px 64px 16px',
                                borderRadius: '4px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                position: 'relative',
                            }}>
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelected(null)}
                                    style={{
                                        position: 'absolute',
                                        top: '-15px',
                                        right: '-15px',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                        boxShadow: 'var(--shadow)',
                                    }}
                                >
                                    <X size={20} />
                                </button>

                                <img src={selected.photo_url} alt={selected.caption}
                                    style={{ width: '100%', borderRadius: '2px', display: 'block' }} />

                                <p style={{
                                    position: 'absolute',
                                    bottom: '18px',
                                    left: '24px',
                                    right: '80px', // leave room for download button
                                    fontFamily: "'Playfair Display', serif",
                                    fontStyle: 'italic',
                                    fontSize: '1rem',
                                    color: '#3a2e1c',
                                    textAlign: 'left',
                                }}>
                                    {selected.caption}
                                </p>

                                {/* Download Button */}
                                <button
                                    onClick={() => downloadPhoto(selected.photo_url, `memory-${selected.id}.jpg`)}
                                    className="btn btn-primary btn-icon"
                                    style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '16px',
                                        padding: '0.6rem',
                                        borderRadius: '12px',
                                    }}
                                    title="Download Photo"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
