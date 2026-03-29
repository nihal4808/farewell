import re

with open('src/components/AdminDashboard.jsx', 'r') as f:
    text = f.read()

# 1. State hooks Add vault state
vault_state = """    const [vaultPhotos, setVaultPhotos] = useState([]);
    const [vaultForm, setVaultForm] = useState({ title: '', date: '', category: 'All Memories', photo_url: '' });"""
text = text.replace("    const [messages, setMessages] = useState([]);", "    const [messages, setMessages] = useState([]);\n" + vault_state)

# 2. Add loadVaultPhotos
load_funcs = """    const loadVaultPhotos = useCallback(async () => {
        try {
            const data = await mockDB.getVaultPhotos();
            setVaultPhotos(data);
        } catch (e) {
            console.error('Failed to load vault photos:', e);
            setVaultPhotos([]);
        }
    }, []);

"""
text = text.replace("    const loadMessages = useCallback(async () => {", load_funcs + "    const loadMessages = useCallback(async () => {")

# 3. Add to useEffect and loadAll
use_eff_start = text.find('        loadSeniors();')
use_eff_end = text.find('    }, [loadSeniors, loadMemories, loadMessages]);')
if use_eff_start != -1:
    text = text.replace("        loadMemories();\n        loadMessages();", "        loadMemories();\n        loadMessages();\n        loadVaultPhotos();")

# 4. Handlers
handlers = """
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
                lowMemoryQuality: 0.84,
                defaultMaxDimension: 1600,
                defaultQuality: 0.88,
                mobileSafeThresholdBytes: 1200 * 1024
            });

            if (prepared.skipInteractiveCrop && prepared.finalImage) {
                setVaultForm(f => ({ ...f, photo_url: prepared.finalImage }));
                return;
            }

            setCropState({ open: true, source: prepared.source, target: 'vault' });
        } catch (error) {
            console.error('Failed to prepare vault image:', error);
            alert('Could not open this image. Please try another photo.');
        } finally {
            e.target.value = '';
        }
    };

    const addVaultPhoto = async () => {
        if (!vaultForm.title.trim() || !vaultForm.photo_url) return alert('Title and photo required for Vault.');
        try {
            await mockDB.addVaultPhoto(vaultForm);
            alert('Vault photo added!');
            setVaultForm({ title: '', date: '', category: 'All Memories', photo_url: '' });
            loadVaultPhotos();
        } catch (e) {
            alert('Failed to add to vault: ' + e.message);
        }
    };

    const deleteVaultPhoto = async (id) => {
        if (!window.confirm('Delete this from vault?')) return;
        try {
            await mockDB.deleteVaultPhoto(id);
            loadVaultPhotos();
        } catch (e) {
            alert('Failed to delete vault photo: ' + e.message);
        }
    };
"""
text = text.replace("    const addMemory = async () => {", handlers + "\n    const addMemory = async () => {")

# 5. Fix crop state target
text = text.replace("""                        } else if (cropState.target === 'memory') {
                            setMemoryForm(f => ({ ...f, photo_url: cropped }));
                        }""", """                        } else if (cropState.target === 'memory') {
                            setMemoryForm(f => ({ ...f, photo_url: cropped }));
                        } else if (cropState.target === 'vault') {
                            setVaultForm(f => ({ ...f, photo_url: cropped }));
                        }""")


# 6. Sidebar item
sidebar_tab = """                    <button className={`admin-sidebar-item ${tab === 'memories' ? 'active' : ''}`} onClick={() => setTab('memories')}>
                        <ImageIcon size={18} /> Timeline Photos
                    </button>
                    <button className={`admin-sidebar-item ${tab === 'vault' ? 'active' : ''}`} onClick={() => setTab('vault')}>
                        <ImageIcon size={18} /> Media Vault
                    </button>"""
text = text.replace("""                    <button className={`admin-sidebar-item ${tab === 'memories' ? 'active' : ''}`} onClick={() => setTab('memories')}>
                        <ImageIcon size={18} /> Event Memories
                    </button>""", sidebar_tab)

# 7. Add UI for Vault
vault_ui = """                    {tab === 'vault' && (
                        <motion.div key="vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Media Vault Uploads</h2>
                            
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
                    )}"""
text = text.replace("{tab === 'settings' && (", vault_ui + "\n                    {tab === 'settings' && (")

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(text)
