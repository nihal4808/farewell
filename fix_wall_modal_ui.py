import sys

def run():
    with open('src/components/GlobalWall.jsx', 'r') as f:
        content = f.read()

    # Add authorName state
    if "const [authorName, setAuthorName] = useState('');" not in content:
        content = content.replace("const [isAnonymous, setIsAnonymous] = useState(true);", "const [isAnonymous, setIsAnonymous] = useState(true);\n    const [authorName, setAuthorName] = useState('');")

    # Fix submitMessage to use authorName
    submit_old = """            await mockDB.addWallMessage({
                text: newMsg.trim(),
                author: isAnonymous ? 'Anonymous' : (currentUser?.name || 'Anonymous'),
                author_id: isAnonymous ? null : currentUser?.id
            });"""
    submit_new = """            await mockDB.addWallMessage({
                text: newMsg.trim(),
                author: isAnonymous ? 'Anonymous' : (authorName.trim() || currentUser?.name || 'Anonymous'),
                author_id: isAnonymous ? null : currentUser?.id
            });"""
    content = content.replace(submit_old, submit_new)

    # Replacement for modal content
    old_modal = """<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans', fontWeight: 800 }}>Leave a Note</h3>
                                <button onClick={() => setIsWriting(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <textarea
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                placeholder="Write your farewell message here..."
                                style={{
                                    width: '100%', height: '150px',
                                    background: 'rgba(255,255,255,0.5)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '8px', padding: '1rem',
                                    fontFamily: 'Caveat, cursive',
                                    fontSize: '1.4rem', color: '#000',
                                    resize: 'none', marginBottom: '1rem'
                                }}
                            />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                                Post Anonymously
                            </label>

                            <button
                                onClick={submitMessage}
                                disabled={sending || !newMsg.trim()}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: '#000', color: 'var(--accent)',
                                    border: 'none', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    fontWeight: 700, cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                                    opacity: newMsg.trim() ? 1 : 0.5
                                }}
                            >
                                <Send size={18} />
                                {sending ? 'Posting...' : 'Post Message'}
                            </button>"""

    new_modal = """<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
                                    disabled={sending || !newMsg.trim()}
                                    style={{
                                        padding: '0.8rem 1.8rem',
                                        background: '#111', color: '#fff',
                                        border: 'none', borderRadius: '40px',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        fontWeight: 600, fontSize: '1rem', cursor: newMsg.trim() ? 'pointer' : 'not-allowed',
                                        opacity: newMsg.trim() ? 1 : 0.5,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    {sending ? 'Pinning...' : 'Pin to Wall'}
                                </button>
                            </div>"""

    if old_modal in content:
        content = content.replace(old_modal, new_modal)
        with open('src/components/GlobalWall.jsx', 'w') as f:
            f.write(content)
        print("Updated successfully")
    else:
        print("Could not locate modal block")

run()
