import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB } from '../data/mockDB';
import { PenTool, X, Send } from 'lucide-react';

export default function GlobalWall({ currentUser, isActive }) {
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [isWriting, setIsWriting] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [authorName, setAuthorName] = useState('');
    const [sending, setSending] = useState(false);

    const ITEMS_PER_PAGE = 12;

    const loadMessages = async () => {
        const msgs = await mockDB.getWallMessages();
        // If empty, add mocks here or let empty state show
        if (msgs.length === 0) {
            const mockMsgs = [
                { id: 'w1', text: 'byeeeee gyussss', author: 'Anonymous', timestamp: Date.now() },
                { id: 'w2', text: 'Love the idea', author: 'Anonymous', timestamp: Date.now() },
                { id: 'w3', text: 'Athrav ke preemi kitne sare hai yaar', author: 'Anonymous', timestamp: Date.now() },
                { id: 'w4', text: 'Ye atharv pe Note kisne likha hai, i love atharv more than her/him😡', author: 'Anonymous', timestamp: Date.now() },
                { id: 'w5', text: 'Atharv sirf meraa h he is mine i like him in bhopal, i saw him there and i was like wow', author: 'Anonymous', timestamp: Date.now() },
                { id: 'w6', text: 'The bitter feeling of when you know that you can\'t meet these amazing people again', author: 'Anonymous', timestamp: Date.now() }
            ];
            for (const m of mockMsgs.reverse()) {
                await mockDB.addWallMessage(m);
            }
            setMessages(mockMsgs);
        } else {
            setMessages(msgs);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

            const submitMessage = async () => {
        if (!newMsg.trim()) {
            alert("Please write something before pinning to the wall!");
            return;
        }
        setSending(true);
        try {
            const finalAuthorName = authorName.trim() || currentUser?.name || 'Anonymous';
            const finalAuthorId = currentUser?.id || null;
            
            await mockDB.addWallMessage({
                text: newMsg.trim(),
                author: isAnonymous ? 'Anonymous' : finalAuthorName,
                author_id: isAnonymous ? null : finalAuthorId
            });
            setNewMsg('');
            setIsWriting(false);
            await loadMessages();
        } catch (e) {
            console.error(e);
            alert("Something went wrong, please try again.");
        } finally {
            setSending(false);
        }
    };

    const displayedMsgs = messages.slice(0, page * ITEMS_PER_PAGE);

    return (
        <div style={{ padding: '6rem 1rem 4rem', minHeight: '100vh', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '0.4rem 1rem', borderRadius: '40px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '1.5rem' }}>
                    <span>💛</span> FINAL GOODBYES
                </div>
                <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Message Wall of Reflection
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    A space to leave your final words, memories, and wishes. These notes will remain here as a testament to our journey.
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {displayedMsgs.map((msg, i) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (i % 6) * 0.1 }}
                        style={{
                            background: '#f4ead5',
                            color: '#1a1814',
                            padding: '2rem',
                            borderRadius: '4px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '220px'
                        }}
                    >
                        <div style={{ 
                            position: 'absolute', 
                            top: '-10px', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: '80px', 
                            height: '24px', 
                            background: 'rgba(255,255,255,0.4)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }} />
                        <p style={{ 
                            fontFamily: 'Caveat, cursive', 
                            fontSize: '1.6rem', 
                            lineHeight: 1.4,
                            flex: 1,
                            whiteSpace: 'pre-wrap'
                        }}>
                            "{msg.text}"
                        </p>
                        <div style={{ 
                            marginTop: '2rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            fontWeight: 700,
                            fontFamily: 'Plus Jakarta Sans, serif',
                            fontSize: '1.1rem'
                        }}>
                            {msg.author || 'Anonymous'}
                        </div>
                    </motion.div>
                ))}
            </div>

            {displayedMsgs.length < messages.length && (
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button 
                        className="btn"
                        onClick={() => setPage(p => p + 1)}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--accent)',
                            color: 'var(--accent)',
                            padding: '0.8rem 2rem',
                            borderRadius: '30px',
                            fontWeight: 600
                        }}
                    >
                        LOAD MORE MESSAGES
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isActive && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsWriting(true)}
                        style={{
                            position: 'fixed',
                            bottom: '6rem', // raised slightly to clear the dock on mobile
                            right: '2rem',
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            padding: '1rem 1.5rem',
                            borderRadius: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 700,
                            boxShadow: '0 10px 25px rgba(236,187,75,0.3)',
                            cursor: 'pointer',
                            zIndex: 100
                        }}
                    >
                        <PenTool size={20} />
                        Write a Message
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isWriting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="card"
                            style={{
                                width: '100%', maxWidth: '500px',
                                background: '#f4ead5', color: '#000',
                                padding: '2rem', borderRadius: '12px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontFamily: 'Caveat, cursive', fontSize: '2rem', fontWeight: 600 }}>Leave a Note...</h3>
                                <button onClick={() => setIsWriting(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <textarea
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                placeholder="I'll never forget..."
                                style={{
                                    width: '100%', height: '160px',
                                    background: 'transparent',
                                    border: 'none', borderBottom: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '0', padding: '1rem 0',
                                    fontFamily: 'Caveat, cursive',
                                    fontSize: '1.6rem', color: '#000',
                                    resize: 'none', outline: 'none', marginBottom: '1rem'
                                }}
                            />

                            <input
                                type="text"
                                placeholder="Your Name (Optional)"
                                value={authorName}
                                onChange={e => setAuthorName(e.target.value)}
                                disabled={isAnonymous}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px dashed rgba(0,0,0,0.15)',
                                    padding: '0.8rem 0',
                                    fontSize: '1rem',
                                    color: '#000',
                                    outline: 'none',
                                    marginBottom: '1rem',
                                    opacity: isAnonymous ? 0.3 : 1
                                }}
                            />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#444' }}>
                                <input 
                                    type="checkbox" 
                                    checked={isAnonymous} 
                                    onChange={e => setIsAnonymous(e.target.checked)} 
                                    style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }} 
                                />
                                Keep it mysterious (Post Anonymously)
                            </label>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={submitMessage}
                                    disabled={sending}
                                    style={{
                                        padding: '0.8rem 1.8rem',
                                        background: '#111', color: '#fff',
                                        border: 'none', borderRadius: '40px',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        fontWeight: 600, fontSize: '1rem', cursor: sending ? 'wait' : 'pointer',
                                        opacity: sending ? 0.7 : 1,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    {sending ? 'Pinning...' : 'Pin to Wall'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
