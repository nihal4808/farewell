import re

with open("src/components/AdminDashboard.jsx", "r") as f:
    text = f.read()

hdr_old = "                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Media Vault Uploads</h2>"
hdr_new = """                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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
                            </div>"""

text = text.replace(hdr_old, hdr_new)

select_old = """                                      <select className="input" value={vaultForm.category} onChange={e => setVaultForm(f => ({ ...f, category: e.target.value }))} style={{ background: '#111' }}>
                                          <option value="All Memories">All Memories</option>
                                          <option value="1st yr">1st yr</option>
                                          <option value="2nd yr">2nd yr</option>
                                          <option value="3rd yr">3rd yr</option>
                                          <option value="4th yr">4th yr</option>
                                          <option value="Fiesta'25">Fiesta'25</option>
                                      </select>"""

select_new = """                                      <select className="input" value={vaultForm.category} onChange={e => setVaultForm(f => ({ ...f, category: e.target.value }))} style={{ background: '#111' }}>
                                          <option value="All Memories">All Memories</option>
                                          {vaultCategories.map(cat => (
                                              <option key={cat} value={cat}>{cat}</option>
                                          ))}
                                      </select>"""

text = text.replace(select_old, select_new)

with open("src/components/AdminDashboard.jsx", "w") as f:
    f.write(text)

