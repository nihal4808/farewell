import re

with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Add Wall tab
content = content.replace(
    "{ id: 'messages', label: 'Messages', icon: MessageSquare },",
    "{ id: 'messages', label: 'Messages', icon: MessageSquare },\n        { id: 'wall', label: 'Wall Pins', icon: MessageSquare },"
)

# 2. Add wall state & loadWall
if "const [wallMessages, setWallMessages]" not in content:
    content = content.replace(
        "const [settingsForm, setSettingsForm] = useState({ vault_categories: [] });",
        "const [settingsForm, setSettingsForm] = useState({ vault_categories: [] });\n    const [wallMessages, setWallMessages] = useState([]);"
    )

if "loadMessages();" in content and "loadWallMessages();" not in content:
    content = content.replace(
        "loadMessages();",
        "loadMessages();\n        loadWallMessages();"
    )
    
if "const loadMessages = async () => {" in content and "const loadWallMessages =" not in content:
    wall_load = """
    const loadWallMessages = async () => {
        const msgs = await mockDB.getWallMessages();
        setWallMessages(msgs || []);
    };
"""
    content = content.replace("const loadMessages = async () => {", wall_load + "\n    const loadMessages = async () => {")

if "const handleDeleteMessage = async (id) => {" in content and "const handleDeleteWallMessage =" not in content:
    wall_del = """
    const handleDeleteWallMessage = async (id) => {
        if(window.confirm('Delete this pinned wall message for everyone?')) {
            await mockDB.deleteWallMessage(id);
            await loadWallMessages();
            alert('Wall message deleted!');
        }
    };
"""
    content = content.replace("const handleDeleteMessage = async (id) => {", wall_del + "\n    const handleDeleteMessage = async (id) => {")

wall_render = """
                    {tab === 'wall' && (
                        <motion.div key="wall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Wall Messages (Global)</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '1.5rem',
                                padding: '1rem 0'
                            }}>
                                {wallMessages.length === 0 && <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No wall pins yet.</div>}
                                {wallMessages.map(msg => (
                                    <div key={msg.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{msg.authorName || 'Anonymous'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(msg.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div style={{ 
                                            marginBottom: '1rem', 
                                            flex: 1, 
                                            fontStyle: 'italic', 
                                            lineHeight: 1.5,
                                            padding: '1rem',
                                            backgroundColor: 'rgba(0,0,0,0.02)',
                                            borderRadius: '8px',
                                            fontSize: '0.95rem'
                                        }}>
                                            "{msg.text}"
                                        </div>
                                        {msg.photoUrl && (
                                            <img src={msg.photoUrl} alt="Attached" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', maxHeight: '200px', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>
                                            <button 
                                                className="btn btn-sm btn-ghost" 
                                                style={{ color: 'var(--danger)', padding: '0.4rem 0.8rem' }}
                                                onClick={() => handleDeleteWallMessage(msg.id)}
                                            >
                                                <Trash2 size={16} style={{marginRight: '0.25rem'}} /> Remove Pin
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
"""

if "{tab === 'wall' && (" not in content:
    content = content.replace("</AnimatePresence>", wall_render + "\n                </AnimatePresence>")

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)
print("Added Wall tab to AdminDashboard.jsx")
