import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB } from '../data/mockDB';
import { PenTool, X, Send, Upload, Search } from 'lucide-react';

export default function AutographWall({ currentUser }) {
    const [seniors, setSeniors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalTarget, setModalTarget] = useState(null);
    const [msgText, setMsgText] = useState('');
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [sending, setSending] = useState(false);

    useEffect(() => { mockDB.adminGetSeniors().then(setSeniors); }, []);

    const openModal = (senior) => {
        setModalTarget(senior);
        setMsgText('');
        setUploadedPhoto(null);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
                setUploadedPhoto(jpegUrl);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const submitMessage = async () => {
        if (!msgText.trim() || !modalTarget) return;
        setSending(true);
        try {
            await mockDB.addMessage({
                from_senior_id: currentUser?.id,
                from_name: currentUser?.name,
                from_photo_url: uploadedPhoto || currentUser?.photo_url || '',
                to_senior_id: modalTarget.id,
                to_name: modalTarget.name,
                message_text: msgText
            });
            setModalTarget(null);
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const filteredSeniors = seniors.filter(s => {
        if (s.id === currentUser?.id) return false;
        return s.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVars = { hidden: { opacity: 0, y: 30, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18 } } };

    return (
        <section style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="wall-controls">
                <div className="wall-search">
                    <Search size={16} color="#888" />
                    <input 
                        type="text" 
                        placeholder="Find a classmate..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <motion.div className="wall-grid" variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {filteredSeniors.map(senior => {
                    // Extract up to 2 initials safely
                    const parts = senior.name ? senior.name.split(' ') : ['A', 'A'];
                    const initials = parts.map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                        <motion.div key={senior.id} variants={itemVars} className="wall-card" onClick={() => openModal(senior)}>
                            <div className="wall-card-bg">
                                {senior.photo_url && senior.photo_url !== 'https://i.pravatar.cc/200' ? (
                                    <img src={senior.photo_url} alt={senior.name} loading="lazy" />
                                ) : (
                                    <div className="wall-card-initials">{initials}</div>
                                )}
                            </div>
                            <div className="wall-card-overlay"></div>
                            
                            <div className="wall-card-hover-btn">
                                WRITE MESSAGE
                            </div>

                            <div className="wall-card-info">
                                <h3 className="wall-card-name">{senior.name}</h3>
                                <div className="wall-card-meta">
                                    <span className="wall-card-dept">{senior.department?.toUpperCase() || 'CSE'}</span>
                                    <span className="wall-card-code">{senior.code || senior.id}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Message Modal */}
            <AnimatePresence>
                {modalTarget && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setModalTarget(null)}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="avatar avatar-sm"><img src={modalTarget.photo_url} alt={modalTarget.name} /></div>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>To: {modalTarget.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Write something meaningful</p>
                                    </div>
                                </div>
                                <motion.button className="btn btn-ghost btn-icon" whileTap={{ scale: 0.9 }} onClick={() => setModalTarget(null)}>
                                    <X size={18} />
                                </motion.button>
                            </div>

                            <textarea className="input" value={msgText} onChange={e => setMsgText(e.target.value)}
                                placeholder="Your heartfelt message..." rows={5} style={{ marginBottom: '1rem' }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                                    <Upload size={16} /> Upload Friendship Photo
                                    <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                                </label>
                                {uploadedPhoto && (
                                    <img src={uploadedPhoto} alt="Preview" style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover' }} />
                                )}
                            </div>

                            <motion.button className="btn btn-primary" whileTap={{ scale: 0.95 }} onClick={submitMessage}
                                style={{ width: '100%' }} disabled={sending}>
                                {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
