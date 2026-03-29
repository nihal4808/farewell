with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

del_wall = """
    const handleDeleteWallMessage = async (id) => {
        if(window.confirm('Delete this pinned wall message for everyone?')) {
            await mockDB.deleteWallMessage(id);
            await loadWallMessages();
            alert('Wall message deleted!');
        }
    };
"""
if "const handleDeleteWallMessage" not in content:
    content = content.replace("const deleteMessage = async (id) => {", del_wall + "\n    const deleteMessage = async (id) => {")

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)

