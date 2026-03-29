import sys

def run():
    with open('src/data/mockDB.js', 'r') as f:
        content = f.read()

    # Add mock key
    if "const MOCK_WALL_KEY" not in content:
        content = content.replace("const MOCK_MESSAGES_KEY = 'mock_messages';", "const MOCK_MESSAGES_KEY = 'mock_messages';\nconst MOCK_WALL_KEY = 'mock_wall_messages';\nconst WALL_COL = 'public_wall';")

    # Add functions to mockDB
    if "getWallMessages()" not in content:
        wall_functions = """
    async getWallMessages() {
        if (USE_FIREBASE) {
            try {
                const q = query(collection(db, WALL_COL), orderBy('timestamp', 'desc'));
                const snap = await withReadTimeout(getDocs(q));
                return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (e) {
                console.warn('Firebase getWallMessages failed, fallback offline', e);
            }
        }
        try {
            const s = localStorage.getItem(MOCK_WALL_KEY);
            return s ? JSON.parse(s) : [];
        } catch { return []; }
    },

    async addWallMessage(data) {
        const msg = {
            ...data,
            timestamp: Date.now()
        };
        if (USE_FIREBASE) {
            try {
                const docRef = await addDoc(collection(db, WALL_COL), msg);
                msg.id = docRef.id;
            } catch (e) {
                console.error('Add wall message failed', e);
                msg.id = 'w_' + Date.now();
            }
        } else {
            msg.id = 'w_' + Date.now();
        }
        
        try {
            const existing = await this.getWallMessages();
            localStorage.setItem(MOCK_WALL_KEY, JSON.stringify([msg, ...existing]));
        } catch {}
        
        return msg;
    },
"""
        content = content.replace("async getSettings()", wall_functions + "\n    async getSettings()")

    with open('src/data/mockDB.js', 'w') as f:
        f.write(content)

run()
