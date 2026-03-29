import re

with open("src/components/AdminDashboard.jsx", "r") as f:
    code = f.read()

# 1. Add state for vault categories
state_inject = """    const [vaultPhotos, setVaultPhotos] = useState([]);
    const [vaultCategories, setVaultCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');"""

code = re.sub(r'const \[vaultPhotos, setVaultPhotos\] = useState\(\[\]\);', state_inject, code)

# 2. Add load categories in useEffect
load_settings = """    const loadSettings = async () => {
        const settings = await mockDB.getSettings();
        setVaultCategories(settings.vault_categories || ['1st yr', '2nd yr', '3rd yr', '4th yr', "Fiesta'25"]);
    };
"""

code = re.sub(r'const loadMemories = async \(\) => {', load_settings + "\n    const loadMemories = async () => {", code)

# Add loadSettings to useEffect
code = code.replace("loadVaultPhotos();", "loadVaultPhotos();\n        loadSettings();")

# 3. Add management logic
management_logic = """
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
"""

code = code.replace("const addVaultPhoto = async () => {", management_logic + "\n    const addVaultPhoto = async () => {")

# 4. Modify Vault section UI
vault_ui_old = """                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Media Vault Uploads</h2>"""
vault_ui_new = """                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Media Vault & Events Manager</h2>
                                    
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
                                        <div key={cat} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem 0.2rem 0.8rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            {cat}
                                            <button onClick={() => deleteVaultCategory(cat)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
"""

code = code.replace(vault_ui_old, vault_ui_new)

# 5. Fix Vault Form Category Dropdown
dropdown_old = """                                            <select 
                                                className="input" 
                                                value={vaultForm.category}
                                                onChange={e => setVaultForm({...vaultForm, category: e.target.value})}
                                            >
                                                <option>All Memories</option>
                                                <option>1st yr</option>
                                                <option>2nd yr</option>
                                                <option>3rd yr</option>
                                                <option>4th yr</option>
                                                <option>Fiesta'25</option>
                                            </select>"""

dropdown_new = """                                            <select 
                                                className="input" 
                                                value={vaultForm.category}
                                                onChange={e => setVaultForm({...vaultForm, category: e.target.value})}
                                            >
                                                <option value="All Memories">All Memories</option>
                                                {vaultCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>"""

code = code.replace(dropdown_old, dropdown_new)


with open("src/components/AdminDashboard.jsx", "w") as f:
    f.write(code)

