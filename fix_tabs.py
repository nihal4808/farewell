import re

with open("src/components/AdminDashboard.jsx", "r") as f:
    text = f.read()

tabs_old = """    const tabs = [
        { id: 'seniors', label: 'Seniors', icon: Users },
        { id: 'memories', label: 'Memories', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];"""

tabs_new = """    const tabs = [
        { id: 'seniors', label: 'Seniors', icon: Users },
        { id: 'memories', label: 'Journey', icon: ImageIcon },
        { id: 'vault', label: 'Archive Vault', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];"""

text = text.replace(tabs_old, tabs_new)

# Update Memories text to Journey text
memories_old = "<h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>All Memory Uploads</h2>"
memories_new = "<h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>All Journey Uploads</h2>"
text = text.replace(memories_old, memories_new)

m1_old = "placeholder=\"Enter memory title\""
m1_new = "placeholder=\"Enter journey title\""
text = text.replace(m1_old, m1_new)

m2_old = "<label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Memory Title</label>"
m2_new = "<label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Journey Title</label>"
text = text.replace(m2_old, m2_new)

m3_old = "<button className=\"btn btn-primary btn-sm\" onClick={addMemory}><Plus size={16} /> Upload Memory</button>"
m3_new = "<button className=\"btn btn-primary btn-sm\" onClick={addMemory}><Plus size={16} /> Upload Journey</button>"
text = text.replace(m3_old, m3_new)

with open("src/components/AdminDashboard.jsx", "w") as f:
    f.write(text)

