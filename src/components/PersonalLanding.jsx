import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function PersonalLanding({ senior, onScrollDown }) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative' }}
        >
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.4, delay: 0.3 }}
                className="avatar avatar-xl"
                style={{ marginBottom: '2rem', border: '3px solid var(--accent)' }}
            >
                <img src={senior.photo_url || 'https://i.pravatar.cc/200'} alt={senior.name} />
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-display"
                style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', fontWeight: 900, color: 'var(--accent)', marginBottom: '0.5rem' }}
            >
                {senior.name}
            </motion.h1>

            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}
            >
                Class of {senior.batch_year || '2026'} · {senior.department || 'AI & Data Science'}
            </motion.p>

            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
                Four years. One story.
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={onScrollDown}
                style={{ position: 'absolute', bottom: '3rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
            >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll to explore</span>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ChevronDown size={24} />
                </motion.div>
            </motion.div>
        </motion.section>
    );
}
