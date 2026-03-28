import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockDB } from '../data/mockDB';
import { PenTool } from 'lucide-react';

export default function AutographWall({ currentUser }) {
    const [seniors, setSeniors] = useState([]);

    useEffect(() => {
        mockDB.adminGetSeniors().then(setSeniors);
    }, []);

    const containerVars = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVars = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.4 } }
    };

    return (
        <div style={{ width: '100%' }}>
            <h2 className="hs-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                Leave Your Mark
            </h2>

            <motion.div
                variants={containerVars}
                initial="hidden"
                animate="show"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1.5rem'
                }}
            >
                {seniors.map(senior => (
                    <motion.div
                        key={senior.id}
                        variants={itemVars}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="hs-card"
                        style={{
                            padding: '1.5rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ width: '80px', height: '80px', borderRadius: '40px', overflow: 'hidden', marginBottom: '1rem', border: '3px solid var(--hs-yellow)' }}>
                            <img src={senior.photo_url || 'https://i.pravatar.cc/200'} alt={senior.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', lineHeight: 1.2, color: 'var(--hs-navy)' }}>{senior.name}</h3>
                        <div style={{ marginTop: '0.8rem', background: 'var(--hs-bg)', padding: '0.4rem', borderRadius: '50%', color: 'var(--hs-teal)' }}>
                            <PenTool size={18} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
