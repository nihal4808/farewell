import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB, MOCK_SENIORS_KEY, MOCK_SENIORS_DEFAULT } from '../data/mockDB';
import { Users, Image as ImageIcon, Settings, MessageSquare, LogOut, Plus, Trash2, Edit3, Save, X, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [tab, setTab] = useState('seniors');
    const [seniors, setSeniors] = useState([]);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', photo_url: '' });

    useEffect(() => { loadSeniors(); }, []);

    const loadSeniors = async () => {
        const data = await mockDB.adminGetSeniors();
        setSeniors(data);
    };
    const saveSeniors = async (arr) => {
        // Note: New architecture handles per-item updates, 
        // but for bulk local state sync we still setSeniors
        setSeniors(arr);
    };

    const startEdit = (s) => { setEditId(s.id); setForm({ name: s.name, code: s.code, photo_url: s.photo_url || '' }); };
    const cancelEdit = () => { setEditId(null); setForm({ name: '', code: '', photo_url: '' }); };
    const saveEdit = async () => {
        const updatedItems = seniors.map(s => s.id === editId ? { ...s, ...form } : s);
        await mockDB.updateSenior(editId, form);
        setSeniors(updatedItems);
        cancelEdit();
    };
    const deleteSenior = async (id) => {
        await mockDB.deleteSenior(id);
        setSeniors(seniors.filter(s => s.id !== id));
    };
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                // Force JPEG (peg) format as requested
                const jpegUrl = canvas.toDataURL('image/jpeg', 0.85);
                setForm(f => ({ ...f, photo_url: jpegUrl }));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const addSenior = async () => {
        if (!form.name.trim()) return;
        const code = form.code || form.name.substring(0, 3).toUpperCase() + String(seniors.length + 1).padStart(3, '0');
        const newS = { name: form.name, code, photo_url: form.photo_url || 'https://i.pravatar.cc/200', department: 'AI & Data Science', batch_year: '2026' };
        await mockDB.addSenior(newS);
        loadSeniors(); // Refresh from DB to get auto-ID
        setForm({ name: '', code: '', photo_url: '' });
    };

    const tabs = [
        { id: 'seniors', label: 'Seniors', icon: Users },
        { id: 'memories', label: 'Memories', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <div className="admin-shell">
            {/* Sidebar */}
            <nav className="admin-sidebar">
                <h2 className="font-display" style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: 800 }}>
                    Admin
                </h2>
                {tabs.map(t => (
                    <div key={t.id} className={`admin-sidebar-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                        <t.icon size={18} /> {t.label}
                    </div>
                ))}
                <div style={{ flex: 1 }} />
                <Link to="/" className="admin-sidebar-item" style={{ color: 'var(--danger)', textDecoration: 'none' }}>
                    <LogOut size={18} /> Exit
                </Link>
            </nav>

            {/* Main Content */}
            <main className="admin-main">
                <AnimatePresence mode="wait">
                    {tab === 'seniors' && (
                        <motion.div key="seniors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Managed Seniors</h2>
                            </div>

                            {/* Add Form */}
                            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Name</label>
                                    <input className="input" placeholder="Full name" value={editId ? '' : form.name} onChange={e => !editId && setForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div style={{ flex: '0 1 120px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Code</label>
                                    <input className="input" placeholder="Auto" value={editId ? '' : form.code} onChange={e => !editId && setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                                </div>
                                <div style={{ flex: '0 1 150px' }}>
                                    <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', width: '100%', padding: '0.8rem' }}>
                                        <Upload size={14} /> {form.photo_url ? 'Photo Added' : 'Add Photo'}
                                        <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                                {!editId && <button className="btn btn-primary btn-sm" onClick={addSenior}><Plus size={16} /> Add</button>}
                            </div>

                            {/* List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {seniors.map(s => (
                                    <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                                        <div className="avatar avatar-sm"><img src={s.photo_url} alt={s.name} /></div>
                                        {editId === s.id ? (
                                            <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 1, padding: '0.5rem 0.75rem' }} />
                                                <input className="input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} style={{ width: 100, padding: '0.5rem 0.75rem' }} />
                                                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', padding: '0.5rem' }}>
                                                    <Upload size={14} />
                                                    <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                                                </label>
                                                <button className="btn btn-primary btn-sm" onClick={saveEdit}><Save size={14} /></button>
                                                <button className="btn btn-ghost btn-sm" onClick={cancelEdit}><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontWeight: 700 }}>{s.name}</h4>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Code: {s.code}</p>
                                                </div>
                                                <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}><Edit3 size={14} /></button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteSenior(s.id)}><Trash2 size={14} /></button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {tab === 'memories' && (
                        <motion.div key="memories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Memory Uploads</h2>
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <ImageIcon size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>Upload and manage shared memory photos.</p>
                                <label className="btn btn-primary" style={{ marginTop: '1.5rem', cursor: 'pointer' }}>
                                    <Plus size={16} /> Upload Photo
                                    <input type="file" accept="image/*" hidden />
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Settings</h2>
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Department</label>
                                    <input className="input" defaultValue="AI & Data Science" style={{ marginTop: '0.25rem' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Batch Year</label>
                                    <input className="input" defaultValue="2026" style={{ marginTop: '0.25rem' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ fontWeight: 600 }}>Autograph Wall Open</label>
                                    <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: 'var(--accent)' }} />
                                </div>
                                <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}><Save size={14} /> Save Settings</button>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'messages' && (
                        <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Messages Viewer</h2>
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <MessageSquare size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>View all submitted autograph messages here. Messages will appear once students start sharing.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
