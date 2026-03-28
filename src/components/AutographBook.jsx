import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB } from '../data/mockDB';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AutographBook({ currentUser }) {
    const [messages, setMessages] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        mockDB.getMessagesFor(currentUser?.code).then(msgs => {
            if (msgs.length === 0) {
                setMessages([
                    { id: 'm1', from_name: 'Bilal Qureshi', message_text: 'You have always been an inspiration to everyone around you. Wishing you all the success the world has to offer. Go shine bright! ✦\n\n— Bilal', from_photo_url: 'https://i.pravatar.cc/600?img=3' },
                    { id: 'm2', from_name: 'Celia Nour', message_text: 'Remembering all the late nights we spent together in the computer lab. Those memories will stay with me forever. Keep creating amazing things!', from_photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80' },
                ]);
            } else { setMessages(msgs); }
        });
    }, [currentUser]);

    const paginate = (dir) => {
        if (pageIndex + dir < 0 || pageIndex + dir >= messages.length) return;
        setDirection(dir);
        setPageIndex(prev => prev + dir);
    };

    const variants = {
        enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (d) => ({ zIndex: 0, x: d < 0 ? 300 : -300, opacity: 0 })
    };

    if (!messages.length) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p className="font-display" style={{ fontSize: '1.2rem' }}>No messages yet...</p>
        </div>
    );

    const msg = messages[pageIndex];

    return (
        <section style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="section-header">
                <h2 className="section-title font-display">Your Book of Memories</h2>
                <p className="section-subtitle">Messages written for you by your friends</p>
            </div>

            <div style={{ position: 'relative', width: '100%', minHeight: '500px', overflow: 'hidden' }}>
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={pageIndex} custom={direction} variants={variants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ x: { type: 'spring', stiffness: 280, damping: 30 }, opacity: { duration: 0.2 } }}
                        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8}
                        onDragEnd={(_, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x;
                            if (swipe < -8000) paginate(1);
                            else if (swipe > 8000) paginate(-1);
                        }}
                        className="book-spread"
                        style={{ position: 'absolute', width: '100%' }}
                    >
                        {/* Left: Text */}
                        <div className="book-page book-page-left">
                            <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#8B6914', marginBottom: '1.5rem' }}>
                                {msg.from_name}
                            </h2>
                            <p style={{ fontSize: '1.15rem', color: '#3a2a10', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                                {msg.message_text}
                            </p>
                        </div>
                        {/* Right: Photo */}
                        <div className="book-page book-page-right">
                            {msg.from_photo_url ? (
                                <img src={msg.from_photo_url} alt={msg.from_name} loading="lazy" />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                    No photo shared
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                <motion.button className="btn btn-secondary btn-icon" whileTap={{ scale: 0.9 }}
                    onClick={() => paginate(-1)} disabled={pageIndex === 0} style={{ opacity: pageIndex === 0 ? 0.3 : 1 }}>
                    <ChevronLeft size={22} />
                </motion.button>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Message {pageIndex + 1} of {messages.length}
                </span>
                <motion.button className="btn btn-secondary btn-icon" whileTap={{ scale: 0.9 }}
                    onClick={() => paginate(1)} disabled={pageIndex >= messages.length - 1} style={{ opacity: pageIndex >= messages.length - 1 ? 0.3 : 1 }}>
                    <ChevronRight size={22} />
                </motion.button>
            </div>
        </section>
    );
}
