import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB } from '../data/mockDB';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AutographBook({ currentUser }) {
    const [messages, setMessages] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        mockDB.getMessagesFor(currentUser.code).then(msgs => {
            if (msgs.length === 0) {
                setMessages([
                    { id: 'm1', from_name: 'Bilal Qureshi', message_text: 'You have always been an inspiration. Wishing you all the success! ✨', from_photo_url: 'https://i.pravatar.cc/600?img=3' },
                    { id: 'm2', from_name: 'Celia Nour', message_text: 'Remembering all the late nights in the lab. Keep creating amazing things!', from_photo_url: 'https://i.pravatar.cc/600?img=5' }
                ]);
            } else {
                setMessages(msgs);
            }
        });
    }, [currentUser]);

    const paginate = (newDirection) => {
        if (pageIndex + newDirection < 0 || pageIndex + newDirection >= messages.length) return;
        setDirection(newDirection);
        setPageIndex(prev => prev + newDirection);
    };

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
        center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
        exit: (dir) => ({ zIndex: 0, x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.95 })
    };

    if (messages.length === 0) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--hs-grey)' }}>Loading your memories...</div>;

    const msg = messages[pageIndex];

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '600px', overflow: 'hidden', padding: '1rem 0' }}>
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={pageIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x;
                            if (swipe < -10000) paginate(1);
                            else if (swipe > 10000) paginate(-1);
                        }}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                            gap: '1.5rem',
                            alignItems: 'stretch'
                        }}
                    >
                        {/* Left Page (Text) */}
                        <div className="hs-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
                            <h2 className="hs-title" style={{ fontSize: '2.5rem', color: 'var(--hs-orange)', marginBottom: '1.5rem' }}>{msg.from_name}</h2>
                            <p style={{ fontSize: '1.3rem', color: 'var(--hs-navy)', lineHeight: 1.8 }}>{msg.message_text}</p>
                        </div>

                        {/* Right Page (Photo) */}
                        <div className="hs-card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', minHeight: window.innerWidth < 768 ? '300px' : 'auto' }}>
                            <img src={msg.from_photo_url} alt="Friendship" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
                <button
                    onClick={() => paginate(-1)}
                    disabled={pageIndex === 0}
                    className="hs-btn hs-btn-secondary"
                    style={{ padding: '1rem', borderRadius: '50%', opacity: pageIndex === 0 ? 0.3 : 1 }}
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="hs-subtitle">Message {pageIndex + 1} of {messages.length}</span>
                <button
                    onClick={() => paginate(1)}
                    disabled={pageIndex === messages.length - 1}
                    className="hs-btn hs-btn-secondary"
                    style={{ padding: '1rem', borderRadius: '50%', opacity: pageIndex === messages.length - 1 ? 0.3 : 1 }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
