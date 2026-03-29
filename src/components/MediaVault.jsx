import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockDB } from '../data/mockDB';



export default function MediaVault() {
    const [photos, setPhotos] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All Memories');
    const [newestFirst, setNewestFirst] = useState(true);
    const [categories, setCategories] = useState(['1st yr', '2nd yr', '3rd yr', '4th yr', 'Fiesta\'25']);

    useEffect(() => {
        mockDB.getVaultPhotos().then(dbPhotos => {
            setPhotos(dbPhotos);
        }).catch(err => console.error(err));
        
        mockDB.getSettings().then(settings => {
             if (settings && settings.vault_categories) {
                 setCategories(settings.vault_categories);
             }
        }).catch(err => console.error(err));
    }, []);

    const filteredPhotos = photos.filter(p => 
        activeCategory === 'All Memories' || p.category === activeCategory
    );

    const sortedPhotos = [...filteredPhotos].sort((a, b) => {
        const timeA = a.uploaded_at?.seconds || a.uploaded_at || 0;
        const timeB = b.uploaded_at?.seconds || b.uploaded_at || 0;
        return newestFirst ? timeB - timeA : timeA - timeB;
    });

    const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVars = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18 } } };

    return (
        <section className="vault-section">
            <div className="vault-header">
                <div className="vault-header-text">
                    <h2 className="vault-title font-display">The Archive</h2>
                    <p className="vault-subtitle">
                        A cinematic collection of fleeting moments, frozen in
                        <br />
                        time. From the first lecture to the final goodbye.
                    </p>
                </div>
                <button 
                    className="vault-sort-btn"
                    onClick={() => setNewestFirst(!newestFirst)}
                >
                    <span style={{ transform: newestFirst ? 'rotate(0deg)' : 'rotate(180deg)', display: 'inline-block', transition: 'transform 0.3s ease' }}>⇅</span>
                    {newestFirst ? 'Newest First' : 'Oldest First'}
                </button>
            </div>

            <div className="vault-filters">
                {['All Memories', ...categories].map(cat => (
                    <button
                        key={cat}
                        className={`vault-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {sortedPhotos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <p className="font-display" style={{ fontSize: '1.2rem' }}>No photos found in this category.</p>
                </div>
            ) : (
                <motion.div className="vault-grid" variants={containerVars} initial="hidden" animate="show">
                    {sortedPhotos.map((photo, i) => (
                        <motion.div key={photo.id || i} variants={itemVars} className="vault-card">
                            <img src={photo.photo_url} alt={photo.title} loading="lazy" className="vault-card-img" />
                            <div className="vault-card-overlay">
                                <span className="vault-card-date">{photo.date}</span>
                                <h3 className="vault-card-title">{photo.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </section>
    );
}
