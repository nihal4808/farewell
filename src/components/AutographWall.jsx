import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB } from '../data/mockDB';
import { PenTool, X, Send, Upload } from 'lucide-react';

export default function AutographWall({ currentUser }) {
    const [seniors, setSeniors] = useState([]);
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

    const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVars = { hidden: { opacity: 0, y: 30, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18 } } };

    return (
        <section style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title font-display">The Autograph Wall</h2>
                <p className="section-subtitle">Click on a classmate to leave your mark</p>
            </div>

            <motion.div className="grid-wall" variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {seniors.filter(s => s.id !== currentUser?.id).map(senior => (
                    <motion.div key={senior.id} variants={itemVars} whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.95 }}
                        className="card" onClick={() => openModal(senior)}
                        style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textAlign: 'center' }}
                    >
                        <div className="avatar avatar-md" style={{ marginBottom: '0.75rem' }}>
                            <img src={senior.photo_url || 'https://i.pravatar.cc/200'} alt={senior.name} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.5rem' }}>{senior.name}</h3>
                        <PenTool size={16} color="var(--accent)" />
                    </motion.div>
                ))}
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
