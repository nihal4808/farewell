import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB, MOCK_SENIORS_KEY } from '../data/mockDB';
import { Users, Image as ImageIcon, Settings, LogOut, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('seniors');
    const [seniors, setSeniors] = useState([]);

    useEffect(() => {
        mockDB.adminGetSeniors().then(setSeniors);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
                width: '100%',
                minHeight: '100vh',
                background: 'var(--hs-bg)',
                padding: '2rem 1rem'
            }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="hs-title" style={{ color: 'var(--hs-navy)', fontSize: '2.2rem' }}>Admin Tools</h1>
                        <p className="hs-subtitle" style={{ color: 'var(--hs-grey)' }}>Manage your Headspace-themed app</p>
                    </div>
                    <Link to="/" className="hs-btn hs-btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}>
                        <LogOut size={16} style={{ marginRight: '8px' }} /> Exit Admin
                    </Link>
                </header>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('seniors')} className={`hs-btn ${activeTab === 'seniors' ? '' : 'hs-btn-secondary'}`}>
                        <Users size={18} style={{ marginRight: '8px' }} /> Seniors
                    </button>
                    <button onClick={() => setActiveTab('memories')} className={`hs-btn ${activeTab === 'memories' ? '' : 'hs-btn-secondary'}`}>
                        <ImageIcon size={18} style={{ marginRight: '8px' }} /> Memories
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'seniors' && (
                        <motion.div
                            key="seniors"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="hs-card"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 className="hs-title" style={{ fontSize: '1.5rem' }}>Managed Seniors</h2>
                                <button className="hs-btn" style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}>
                                    <Plus size={16} style={{ marginRight: '6px' }} /> Add Senior
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {seniors.map(s => (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--hs-bg)', borderRadius: '16px', gap: '1rem' }}>
                                        <img src={s.photo_url} alt={s.name} style={{ width: '50px', height: '50px', borderRadius: '25px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.name}</h4>
                                            <p style={{ color: 'var(--hs-grey)', fontSize: '0.9rem' }}>Code: {s.code}</p>
                                        </div>
                                        <button className="hs-btn hs-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Edit</button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'memories' && (
                        <motion.div
                            key="memories"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="hs-card"
                            style={{ textAlign: 'center', padding: '4rem 2rem' }}
                        >
                            <ImageIcon size={48} color="var(--hs-teal)" style={{ marginBottom: '1rem' }} />
                            <h2 className="hs-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Memory Uploads</h2>
                            <p className="hs-subtitle">Upload and manage all friendship photos submitted by your peers.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
