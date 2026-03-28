import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function EntryScreen({ onLogin }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isPunching, setIsPunching] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim()) {
            setError('Please enter a code to begin');
            shake();
            return;
        }
        // Check code logic (stubbed for now to pass through)
        onLogin(code);
    };

    const shake = () => {
        setIsPunching(true);
        setTimeout(() => setIsPunching(false), 400);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                textAlign: 'center'
            }}
        >
            <motion.div
                className="hs-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                style={{ maxWidth: '420px', width: '100%' }}
            >
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 className="hs-title" style={{ fontSize: '2.8rem', color: 'var(--hs-orange)', marginBottom: '0.5rem' }}>
                        ALvida'26
                    </h1>
                    <p className="hs-subtitle" style={{ fontSize: '1.2rem', color: 'var(--hs-grey)' }}>
                        Enter your code to begin your journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <motion.div animate={isPunching ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                            placeholder="• • • • • •"
                            className="hs-input"
                            maxLength={7}
                            style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', fontWeight: '800' }}
                        />
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ color: '#FF6B6B', fontWeight: '700', fontSize: '0.9rem', margin: 0 }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button type="submit" className="hs-btn" style={{ marginTop: '0.5rem', width: '100%' }}>
                        Begin My Journey <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
