import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AutographWall from './AutographWall';
import AutographBook from './AutographBook';

export default function MainDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('wall'); // 'wall' or 'book'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                width: '100%',
                minHeight: '100vh',
                background: 'var(--hs-bg)',
                padding: '2rem 1rem',
                maxWidth: '800px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}
        >
            <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h1 className="hs-title" style={{ fontSize: '2.5rem', color: 'var(--hs-navy)' }}>
                    Welcome back, {user?.name || 'Friend'}
                </h1>
                <p className="hs-subtitle" style={{ color: 'var(--hs-orange)' }}>
                    Your digital memories
                </p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                    onClick={() => setActiveTab('wall')}
                    className={activeTab === 'wall' ? 'hs-btn' : 'hs-btn hs-btn-secondary'}
                    style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}
                >
                    Sign Autographs
                </button>
                <button
                    onClick={() => setActiveTab('book')}
                    className={activeTab === 'book' ? 'hs-btn' : 'hs-btn hs-btn-secondary'}
                    style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}
                >
                    My Book
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ flex: 1, width: '100%' }}
                >
                    {activeTab === 'wall' && <AutographWall currentUser={user} />}
                    {activeTab === 'book' && <AutographBook currentUser={user} />}
                </motion.div>
            </AnimatePresence>

        </motion.div>
    );
}
