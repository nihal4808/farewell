import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MOCK_MEMORIES = [
    { id: 'm1', photo_url: 'https://picsum.photos/seed/farewell1/600/450', caption: 'Our first day together — a journey begins.' },
    { id: 'm2', photo_url: 'https://picsum.photos/seed/farewell2/600/450', caption: 'Late-night study sessions and endless laughter.' },
    { id: 'm3', photo_url: 'https://picsum.photos/seed/farewell3/600/450', caption: 'Annual fest — We owned the stage!' },
    { id: 'm4', photo_url: 'https://picsum.photos/seed/farewell4/600/450', caption: 'Project expo — bringing ideas to life.' },
    { id: 'm5', photo_url: 'https://picsum.photos/seed/farewell5/600/450', caption: 'The farewell dinner — bittersweet goodbyes.' },
    { id: 'm6', photo_url: 'https://picsum.photos/seed/farewell6/600/450', caption: 'The team that made it all possible.' },
];

export default function MemoryGallery() {
    const [selected, setSelected] = useState(null);

    return (
        <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title font-display">Our Memories</h2>
                <p className="section-subtitle">Moments we shared, forever treasured</p>
            </div>

            <div className="memory-grid">
                {MOCK_MEMORIES.map((m, i) => (
                    <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
                        className="card"
                        style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelected(m)}
                    >
                        <div style={{ position: 'relative', paddingTop: '66%', overflow: 'hidden' }}>
                            <img src={m.photo_url} alt={m.caption} loading="lazy"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                                onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={e => e.target.style.transform = 'scale(1)'}
                            />
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{m.caption}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            {selected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    onClick={() => setSelected(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 25 }}
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '700px', width: '100%' }}
                    >
                        <img src={selected.photo_url} alt={selected.caption}
                            style={{ width: '100%', borderRadius: '16px', boxShadow: 'var(--shadow)' }} />
                        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {selected.caption}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}
