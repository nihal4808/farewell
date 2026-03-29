import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';

const ADMIN_PASSWORD = 'nihal77';

export default function EntryScreen({ onLogin, onAdminUnlock }) {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedCode = code.trim();
        if (!trimmedCode) { setError('Please enter your access code'); triggerShake(); return; }

        if (trimmedCode === ADMIN_PASSWORD) {
            try {
                await signInAnonymously(auth);
                onAdminUnlock?.();
                navigate('/admin');
            } catch (error) {
                setError('Authentication failed. Please try again.');
                triggerShake();
            }
            return;
        }

        // Try user login
        try {
            await signInAnonymously(auth);
        } catch (error) {
            setError('Login blocked on this browser. Try normal mode (not private) or check Firebase Anonymous Auth is enabled.');
            triggerShake();
            return;
        }

        const result = await onLogin(trimmedCode);
        if (result === false) {
            setError('Invalid access code. Please try again.');
            triggerShake();
        }
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
                style={{ maxWidth: '460px', width: '100%', padding: '3rem 2.4rem', textAlign: 'center', position: 'relative', zIndex: 1, borderRadius: 28 }}
            >
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}>
                    <Sparkles size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                </motion.div>

                <h1 className="font-display" style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    ALvida'26
                </h1>
                <p style={{ color: 'var(--accent)', fontSize: '1.03rem', fontWeight: 600, marginBottom: '0.35rem', fontStyle: 'italic' }}>
                    A Journey We'll Always Carry
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2.2rem' }}>
                    Click To Start The Journey
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <motion.div animate={shake ? { x: [-12, 12, -12, 12, 0] } : {}} transition={{ duration: 0.4 }}>
                        <input
                            type="text" value={code}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCode(val);
                                setError('');
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
                        Start Journey <ArrowRight size={18} />
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
}
