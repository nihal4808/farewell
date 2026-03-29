with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# Fix state
if "const [wallMessages, setWallMessages]" not in content:
    content = content.replace("const [messages, setMessages] = useState([]);", "const [messages, setMessages] = useState([]);\n    const [wallMessages, setWallMessages] = useState([]);")

# Fix handleDeleteWallMessage
if "const handleDeleteWallMessage" not in content:
    del_wall = """
    const handleDeleteWallMessage = async (id) => {
        if(window.confirm('Delete this pinned wall message for everyone?')) {
            await mockDB.deleteWallMessage(id);
            await loadWallMessages();
            alert('Wall message deleted!');
        }
    };
"""
    content = content.replace("const handleDeleteMessage = async (id) => {", del_wall + "\n    const handleDeleteMessage = async (id) => {")

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)

