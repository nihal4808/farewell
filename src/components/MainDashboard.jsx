import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalLanding from './PersonalLanding';
import MemoryGallery from './MemoryGallery';
import AutographWall from './AutographWall';
import AutographBook from './AutographBook';
import { Download } from 'lucide-react';

export default function MainDashboard({ user }) {
    const contentRef = useRef(null);

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%' }}
        >
            {/* Section 1: Personal Landing */}
            <PersonalLanding senior={user} onScrollDown={scrollToContent} />

            {/* Scrollable content */}
            <div ref={contentRef}>
                {/* Section 2: Memory Gallery */}
                <MemoryGallery />

                {/* Divider */}
                <div style={{ width: '60px', height: '2px', background: 'var(--accent-dim)', margin: '2rem auto' }} />

                {/* Section 3: Autograph Wall */}
                <AutographWall currentUser={user} />

                {/* Divider */}
                <div style={{ width: '60px', height: '2px', background: 'var(--accent-dim)', margin: '2rem auto' }} />

                {/* Section 4: Autograph Book */}
                <AutographBook currentUser={user} />

                {/* Section 5: PDF Download */}
                <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <motion.button
                        className="btn btn-primary"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}
                    >
                        <Download size={20} /> Download Your Autograph Book
                    </motion.button>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Saves as a PDF — one message per page
                    </p>
                </section>
            </div>
        </motion.div>
    );
}
