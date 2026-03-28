import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const ADMIN_PASSWORD = 'nihal77';

export default function EntryScreen({ onLogin }) {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim()) { setError('Please enter your access code'); triggerShake(); return; }
        onLogin(code);
    };

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', position: 'relative' }}
        >
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="card card-glow"
                style={{ maxWidth: '440px', width: '100%', padding: '3rem 2.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
            >
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}>
                    <Sparkles size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                </motion.div>

                <h1 className="font-display" style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    ALvida'26
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 500, marginBottom: '2.5rem' }}>
                    Enter your access code to begin
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <motion.div animate={shake ? { x: [-12, 12, -12, 12, 0] } : {}} transition={{ duration: 0.4 }}>
                        <input
                            type="text" value={code}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCode(val);
                                setError('');
                                // Auto-enter admin on password match
                                if (val === ADMIN_PASSWORD) {
                                    navigate('/admin');
                                }
                            }}
                            placeholder="ACCESS CODE"
                            className="input"
                            maxLength={8}
                            style={{ textAlign: 'center', letterSpacing: '0.35em', fontSize: '1.3rem', fontWeight: 800, padding: '1.25rem' }}
                        />
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.85rem' }}>
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{ marginTop: '0.5rem', width: '100%', padding: '1.1rem', fontSize: '1.05rem' }}>
                        Begin My Journey <ArrowRight size={18} />
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
}
