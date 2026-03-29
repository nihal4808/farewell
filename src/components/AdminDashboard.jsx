import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDB, MOCK_SENIORS_KEY, MOCK_SENIORS_DEFAULT } from '../data/mockDB';
import { preparePickedImage } from '../lib/prepareImageForCrop';
import { Users, Image as ImageIcon, Settings, MessageSquare, LogOut, Plus, Trash2, Edit3, Save, X, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageCropModal from './ImageCropModal';
import UploadSizeHelpModal from './UploadSizeHelpModal';

export default function AdminDashboard({ onAdminLogout }) {
    const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB limit
    const COMPRESS_HELP_URL = 'https://imagecompressor.11zon.com/en/image-compressor/compress-image-to-10mb';

    const [tab, setTab] = useState('seniors');
    const [seniors, setSeniors] = useState([]);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', photo_url: '' });
    const [memories, setMemories] = useState([]);
    const [messages, setMessages] = useState([]);
    const [wallMessages, setWallMessages] = useState([]);
        const [vaultPhotos, setVaultPhotos] = useState([]);
    const [vaultCategories, setVaultCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [vaultForm, setVaultForm] = useState({ title: '', date: '', category: 'All Memories', photo_url: '' });
    const [memoryForm, setMemoryForm] = useState({ title: '', photo_url: '' });
    const [cropState, setCropState] = useState({ open: false, source: '', target: 'senior' });
    const [sizeHelpOpen, setSizeHelpOpen] = useState(false);

    const clearCropSource = useCallback(() => {
        if (typeof cropState.source === 'string' && cropState.source.startsWith('blob:')) {
            URL.revokeObjectURL(cropState.source);
        }
        setCropState(prev => ({ ...prev, source: '' }));
    }, [cropState.source]);

    useEffect(() => {
        return () => {
            if (typeof cropState.source === 'string' && cropState.source.startsWith('blob:')) {
                URL.revokeObjectURL(cropState.source);
            }
        };
    }, [cropState.source]);

    useEffect(() => {
        loadSeniors();
        loadMemories();
        loadMessages();
        loadWallMessages();
        loadVaultPhotos();
        loadSettings();
    }, []);

        const loadSettings = async () => {
        const settings = await mockDB.getSettings();
        setVaultCategories(settings.vault_categories || ['1st yr', '2nd yr', '3rd yr', '4th yr', "Fiesta'25"]);
    };

    const loadMemories = async () => {
        const data = await mockDB.getAllMemories();
        setMemories(data);
    };
    
    const loadWallMessages = async () => {
        const msgs = await mockDB.getWallMessages();
        setWallMessages(msgs || []);
    };

    const loadMessages = async () => {
        const data = await mockDB.adminGetAllMessages();
        setMessages(data);
    };

    const loadVaultPhotos = async () => {
        const data = await mockDB.getVaultPhotos();
        setVaultPhotos(data);
    };

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
        try {
            const updatedItems = seniors.map(s => s.id === editId ? { ...s, ...form } : s);
            await mockDB.updateSenior(editId, form);
            setSeniors(updatedItems);
            cancelEdit();
        } catch (error) {
            alert(error.message || 'Failed to update senior.');
        }
    };
    const deleteSenior = async (id) => {
        try {
            await mockDB.deleteSenior(id);
            setSeniors(seniors.filter(s => s.id !== id));
        } catch (error) {
            alert(error.message || 'Failed to delete senior.');
        }
    };

    const openCropperForFile = async (file, target) => {
        if (!file) return;

        if (file.size > MAX_UPLOAD_BYTES) {
            setSizeHelpOpen(true);
            return;
        }

        try {
            const prepared = await preparePickedImage(file, {
                lowMemoryMaxDimension: 1280,
                lowMemoryQuality: 0.88,
                defaultMaxDimension: 1920,
                defaultQuality: 0.94,
                mobileSafeThresholdBytes: 3000 * 1024
            });

            if (prepared.skipInteractiveCrop && prepared.finalImage) {
                if (target === 'memory') {
                    setMemoryForm(f => ({ ...f, photo_url: prepared.finalImage }));
                } else {
                    setForm(f => ({ ...f, photo_url: prepared.finalImage }));
                }
                return;
            }

            if (target === 'memory') setMemoryForm(f => ({ ...f, photo_url: prepared.source })); else setForm(f => ({ ...f, photo_url: prepared.source }));
        } catch (error) {
            console.error('Failed to prepare image for crop:', error);
            alert('Could not open this image. Please try another photo.');
        }
    };

    const handleMemoryPhotoUpload = (e) => {
        const file = e.target.files[0];
        openCropperForFile(file, 'memory');
        e.target.value = '';
    };


    const handleVaultPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_UPLOAD_BYTES) {
            setSizeHelpOpen(true);
            e.target.value = '';
            return;
        }

        try {
            const prepared = await preparePickedImage(file, {
                lowMemoryMaxDimension: 1280,
                lowMemoryQuality: 0.88,
                defaultMaxDimension: 1920,
                defaultQuality: 0.94,
                mobileSafeThresholdBytes: 3000 * 1024
            });

            if (prepared.skipInteractiveCrop && prepared.finalImage) {
                setVaultForm(f => ({ ...f, photo_url: prepared.finalImage }));
                return;
            }

            setVaultForm(f => ({ ...f, photo_url: prepared.source }));
        } catch (error) {
            console.error('Failed to prepare vault image:', error);
            alert('Could not open this image. Please try another photo.');
        } finally {
            e.target.value = '';
        }
    };

    
    const addVaultCategory = async () => {
        if (!newCategory.trim()) return;
        const updated = [...vaultCategories, newCategory.trim()];
        setVaultCategories(updated);
        setNewCategory('');
        const settings = await mockDB.getSettings();
        await mockDB.saveSettings({ ...settings, vault_categories: updated });
    };

    const deleteVaultCategory = async (catToRemove) => {
        if (!window.confirm('Remove this event/category?')) return;
        const updated = vaultCategories.filter(c => c !== catToRemove);
        setVaultCategories(updated);
        const settings = await mockDB.getSettings();
        await mockDB.saveSettings({ ...settings, vault_categories: updated });
        // Automatically default back form category if it was the removed one
        if (vaultForm.category === catToRemove) setVaultForm(prev => ({ ...prev, category: 'All Memories' }));
    };

    const addVaultPhoto = async () => {
        if (!vaultForm.title.trim() || !vaultForm.photo_url) return alert('Title and photo required for Vault.');
        try {
            await mockDB.addVaultPhoto(vaultForm);
            alert('Vault photo added!');
            setVaultForm({ title: '', date: '', category: 'All Memories', photo_url: '' });
            loadVaultPhotos();
        loadSettings();
        } catch (e) {
            alert('Failed to add to vault: ' + e.message);
        }
    };

    const deleteVaultPhoto = async (id) => {
        if (!window.confirm('Delete this from vault?')) return;
        try {
            await mockDB.deleteVaultPhoto(id);
            loadVaultPhotos();
        loadSettings();
        } catch (e) {
            alert('Failed to delete vault photo: ' + e.message);
        }
    };

    const addMemory = async () => {
        if (!memoryForm.photo_url || !memoryForm.title.trim()) return;
        try {
            await mockDB.addMemory({ title: memoryForm.title.trim(), caption: memoryForm.title.trim(), photo_url: memoryForm.photo_url });
            setMemoryForm({ title: '', photo_url: '' });
            loadMemories();
        } catch (error) {
            alert(error.message || 'Failed to upload memory.');
        }
    };

    const deleteMemory = async (id) => {
        try {
            await mockDB.deleteMemory(id);
            loadMemories();
        } catch (error) {
            alert(error.message || 'Failed to delete memory.');
        }
    };
    
    const handleDeleteWallMessage = async (id) => {
        if(window.confirm('Delete this pinned wall message for everyone?')) {
            await mockDB.deleteWallMessage(id);
            await loadWallMessages();
            alert('Wall message deleted!');
        }
    };

    const deleteMessage = async (id) => {
        try {
            await mockDB.deleteMessage(id);
            loadMessages();
        loadWallMessages();
        } catch (error) {
            alert(error.message || 'Failed to delete message.');
        }
    };
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        openCropperForFile(file, 'senior');
        e.target.value = '';
    };

    const addSenior = async () => {
        if (!form.name.trim()) return;
        const code = form.code || form.name.substring(0, 3).toUpperCase() + String(seniors.length + 1).padStart(3, '0');
        const newS = { name: form.name, code, photo_url: form.photo_url || 'https://i.pravatar.cc/200', department: 'AI & Data Science', batch_year: '2026' };
        try {
            await mockDB.addSenior(newS);
            loadSeniors(); // Refresh from DB to get auto-ID
            setForm({ name: '', code: '', photo_url: '' });
        } catch (error) {
            alert(error.message || 'Failed to add senior.');
        }
    };

    const tabs = [
        { id: 'seniors', label: 'Seniors', icon: Users },
        { id: 'memories', label: 'Journey', icon: ImageIcon },
        { id: 'vault', label: 'Archive Vault', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'wall', label: 'Wall Pins', icon: MessageSquare },
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
                <Link to="/" onClick={() => onAdminLogout?.()} className="admin-sidebar-item" style={{ color: 'var(--danger)', textDecoration: 'none' }}>
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>All Journey Uploads</h2>

                            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: '1 1 260px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Journey Title</label>
                                    <input className="input" placeholder="Enter journey title" value={memoryForm.title} onChange={e => setMemoryForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div style={{ flex: '0 1 170px' }}>
                                    <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', width: '100%', padding: '0.8rem' }}>
                                        <Upload size={14} /> {memoryForm.photo_url ? 'Photo Added' : 'Add Photo'}
                                        <input type="file" accept="image/*" hidden onChange={handleMemoryPhotoUpload} />
                                    </label>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={addMemory}><Plus size={16} /> Upload Journey</button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '1.5rem',
                                padding: '1rem 0'
                            }}>
                                {memories.length === 0 && <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No memories uploaded yet.</div>}
                                {memories.map(mem => (
                                    <div key={mem.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <img src={mem.photo_url} alt={mem.title || mem.caption || 'Memory'} style={{ width: '100%', maxWidth: 200, borderRadius: 8, marginBottom: 8 }} />
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{mem.title || mem.caption}</div>
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginTop: '0.75rem' }} onClick={() => deleteMemory(mem.id)}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                                        {tab === 'vault' && (
                        <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Media Vault & Archive Events</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input 
                                        type="text" 
                                        placeholder="New Event (e.g. Prom'26)" 
                                        className="input" 
                                        value={newCategory} 
                                        onChange={e => setNewCategory(e.target.value)}
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={addVaultCategory}><Plus size={16} /> Add Event</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                {vaultCategories.map(cat => (
                                    <div key={cat} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.3rem 0.6rem 0.3rem 1rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                        {cat}
                                        <button onClick={() => deleteVaultCategory(cat)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Photo Title*</label>
                                    <input className="input" placeholder="e.g. Farewell party" value={vaultForm.title} onChange={e => setVaultForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div style={{ flex: '1 1 120px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Date Label</label>
                                    <input className="input" placeholder="e.g. May 2025" value={vaultForm.date} onChange={e => setVaultForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div style={{ flex: '1 1 120px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Category Filter</label>
                                    <select className="input" value={vaultForm.category} onChange={e => setVaultForm(f => ({ ...f, category: e.target.value }))} style={{ background: '#111' }}>
                                        <option value="All Memories">All Memories</option>
                                        <option value="1st yr">1st yr</option>
                                        <option value="2nd yr">2nd yr</option>
                                        <option value="3rd yr">3rd yr</option>
                                        <option value="4th yr">4th yr</option>
                                        <option value="Fiesta'25">Fiesta'25</option>
                                    </select>
                                </div>
                                <div style={{ flex: '0 1 170px' }}>
                                    <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', width: '100%', padding: '0.8rem' }}>
                                        <Upload size={14} /> {vaultForm.photo_url ? 'Photo Added' : 'Add Photo'}
                                        <input type="file" accept="image/*" hidden onChange={handleVaultPhotoUpload} />
                                    </label>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={addVaultPhoto}><Plus size={16} /> Upload Vault Photo</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                                {vaultPhotos.map(photo => (
                                    <div key={photo.id} style={{
                                        position: 'relative', background: '#222', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)'
                                    }}>
                                        <img src={photo.photo_url} alt={photo.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{photo.category} &bull; {photo.date}</div>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0.2rem 0 0.8rem' }}>{photo.title}</h4>
                                            
                                            <button className="btn btn-secondary btn-sm" style={{ width: '100%', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.2)' }}
                                                onClick={() => deleteVaultPhoto(photo.id)}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>All Messages</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '1.5rem',
                                padding: '1rem 0'
                            }}>
                                {messages.length === 0 && <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No messages yet.</div>}
                                {messages.map(msg => (
                                    <div key={msg.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar avatar-sm"><img src={msg.from_photo_url} alt={msg.from_name} /></div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{msg.from_name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To: {msg.to_name}</div>
                                            </div>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: 'var(--danger)', marginLeft: 'auto' }}
                                                onClick={() => deleteMessage(msg.id)}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                        <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{msg.message_text}</div>
                                        {msg.from_photo_url && <img src={msg.from_photo_url} alt="Attached" style={{ width: 80, borderRadius: 6, marginTop: 4 }} />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                
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

                </AnimatePresence>
            </main>


            <UploadSizeHelpModal
                open={sizeHelpOpen}
                siteUrl={COMPRESS_HELP_URL}
                onClose={() => setSizeHelpOpen(false)}
                onGoToSite={() => {
                    window.open(COMPRESS_HELP_URL, '_blank', 'noopener,noreferrer');
                    setSizeHelpOpen(false);
                }}
            />
        </div>
    );
}
