import re

with open("src/data/mockDB.js", "r") as f:
    code = f.read()

# Add imports if needed, though they exist

# Add Constants
constants_block = """
export const MOCK_VAULT_KEY = 'hw_mock_vault';
export const MOCK_VAULT_DEFAULT = [
    { id: 'v1', category: 'All Memories', photo_url: 'https://i.pravatar.cc/300?img=1' },
    { id: 'v2', category: 'All Memories', photo_url: 'https://i.pravatar.cc/300?img=2' },
];

const VAULT_COL = 'vault';
"""

if "MOCK_VAULT_KEY" not in code:
    code = code.replace("export const MOCK_MESSAGES_KEY = 'hw_mock_messages';", "export const MOCK_MESSAGES_KEY = 'hw_mock_messages';\n" + constants_block)

# Add Vault Methods
vault_methods = """
    // Vault
    async getVaultPhotos() {
        try {
            const q = query(collection(db, VAULT_COL));
            const snap = await withTimeout(getDocs(q));
            if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return MOCK_VAULT_DEFAULT;
        } catch(e) {
            const s = localStorage.getItem(MOCK_VAULT_KEY);
            return s ? JSON.parse(s) : MOCK_VAULT_DEFAULT;
        }
    },
    async addVaultPhoto(photoData) {
        try {
            await withTimeout(addDoc(collection(db, VAULT_COL), { ...photoData, created_at: serverTimestamp() }));
        } catch(e) {
            const photos = await this.getVaultPhotos();
            const newP = { ...photoData, id: 'v' + Date.now() };
            localStorage.setItem(MOCK_VAULT_KEY, JSON.stringify([...photos, newP]));
        }
    },
    async deleteVaultPhoto(id) {
        try {
            await withTimeout(deleteDoc(doc(db, VAULT_COL, id)));
        } catch(e) {
            const photos = await this.getVaultPhotos();
            const filtered = photos.filter(p => p.id !== id);
            localStorage.setItem(MOCK_VAULT_KEY, JSON.stringify(filtered));
        }
    },
"""

if "getVaultPhotos" not in code:
    code = code.replace("export const mockDB = {", "export const mockDB = {\n" + vault_methods)

with open("src/data/mockDB.js", "w") as f:
    f.write(code)

