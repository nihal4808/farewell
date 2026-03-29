with open("src/data/mockDB.js", "r") as f:
    text = f.read()

constants = """
export const MOCK_VAULT_KEY = 'hw_mock_vault';
export const MOCK_VAULT_DEFAULT = [
    { id: 'v1', category: 'All Memories', title: 'The Starting Line', date: 'Fall 2022', photo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600' },
    { id: 'v2', category: '1st yr', title: 'First Hackathon', date: 'Winter 2022', photo_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600' },
];
const VAULT_COL = 'vault';
"""

methods = """
    // Vault
    async getVaultPhotos() {
        try {
            const q = query(collection(db, VAULT_COL));
            const snap = await withReadTimeout(getDocs(q));
            if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return MOCK_VAULT_DEFAULT;
        } catch(e) {
            const s = localStorage.getItem(MOCK_VAULT_KEY);
            return s ? JSON.parse(s) : MOCK_VAULT_DEFAULT;
        }
    },
    async addVaultPhoto(photoData) {
        try {
            await withWriteTimeout(addDoc(collection(db, VAULT_COL), { ...photoData, created_at: serverTimestamp(), uploaded_at: serverTimestamp() }));
        } catch(e) {
            const photos = await this.getVaultPhotos();
            const newP = { ...photoData, id: 'v' + Date.now(), uploaded_at: Date.now() };
            localStorage.setItem(MOCK_VAULT_KEY, JSON.stringify([...photos, newP]));
        }
    },
    async deleteVaultPhoto(id) {
        try {
            await withWriteTimeout(deleteDoc(doc(db, VAULT_COL, id)));
        } catch(e) {
            const photos = await this.getVaultPhotos();
            const filtered = photos.filter(p => p.id !== id);
            localStorage.setItem(MOCK_VAULT_KEY, JSON.stringify(filtered));
        }
    },
"""

if "MOCK_VAULT_KEY" not in text:
    text = text.replace("const MESSAGES_COL = 'messages';", "const MESSAGES_COL = 'messages';\n" + constants)

if "getVaultPhotos" not in text:
    text = text.replace("export const mockDB = {", "export const mockDB = {\n" + methods)

with open("src/data/mockDB.js", "w") as f:
    f.write(text)

