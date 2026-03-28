import { db } from '../lib/firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';

export const MOCK_SETTINGS_KEY = 'hw_mock_settings';
export const MOCK_SENIORS_KEY = 'hw_mock_seniors';
export const MOCK_MESSAGES_KEY = 'hw_mock_messages';

export const MOCK_SETTINGS_DEFAULT = {
    department: 'AI & Data Science',
    batch_year: '2026',
    autograph_open: true
};

export const MOCK_SENIORS_DEFAULT = [
    { id: 's1', name: 'Amira Hassan', department: 'AI & Data Science', batch_year: '2026', code: 'AMH001', photo_url: 'https://i.pravatar.cc/200?img=1' },
    { id: 's2', name: 'Bilal Qureshi', department: 'AI & Data Science', batch_year: '2026', code: 'BLQ002', photo_url: 'https://i.pravatar.cc/200?img=3' },
];

// Collection Names
const SETTINGS_COL = 'settings';
const SENIORS_COL = 'seniors';
const MESSAGES_COL = 'messages';

export const mockDB = {
    // Settings
    async getSettings() {
        try {
            const docRef = doc(db, SETTINGS_COL, 'global');
            const snap = await getDoc(docRef);
            if (snap.exists()) return snap.data();
            return { department: 'AI & Data Science', batch_year: '2026', autograph_open: true };
        } catch (e) {
            console.warn("Firebase not configured? Falling back to localStorage.", e);
            const s = localStorage.getItem(MOCK_SETTINGS_KEY);
            return s ? JSON.parse(s) : { department: 'AI & Data Science', batch_year: '2026', autograph_open: true };
        }
    },
    async saveSettings(data) {
        const docRef = doc(db, SETTINGS_COL, 'global');
        await updateDoc(docRef, data).catch(() => addDoc(collection(db, SETTINGS_COL), { ...data, id: 'global' }));
        localStorage.setItem(MOCK_SETTINGS_KEY, JSON.stringify(data));
    },

    // Seniors
    async adminGetSeniors() {
        try {
            const q = query(collection(db, SENIORS_COL));
            const snap = await getDocs(q);
            if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            throw new Error("Empty Firestore");
        } catch (e) {
            console.log("Using localStorage fallback for seniors");
            const s = localStorage.getItem(MOCK_SENIORS_KEY);
            return s ? JSON.parse(s) : MOCK_SENIORS_DEFAULT;
        }
    },
    async addSenior(senior) {
        try {
            await addDoc(collection(db, SENIORS_COL), { ...senior, created_at: serverTimestamp() });
        } catch (e) {
            console.warn("Firestore add failed, saving to localStorage", e);
            const seniors = await this.adminGetSeniors();
            const newS = { ...senior, id: 's' + Date.now() };
            localStorage.setItem(MOCK_SENIORS_KEY, JSON.stringify([...seniors, newS]));
        }
    },
    async updateSenior(id, data) {
        try {
            const docRef = doc(db, SENIORS_COL, id);
            await updateDoc(docRef, data);
        } catch (e) {
            const seniors = await this.adminGetSeniors();
            const updated = seniors.map(s => s.id === id ? { ...s, ...data } : s);
            localStorage.setItem(MOCK_SENIORS_KEY, JSON.stringify(updated));
        }
    },
    async deleteSenior(id) {
        try {
            await deleteDoc(doc(db, SENIORS_COL, id));
        } catch (e) {
            const seniors = await this.adminGetSeniors();
            const filtered = seniors.filter(s => s.id !== id);
            localStorage.setItem(MOCK_SENIORS_KEY, JSON.stringify(filtered));
        }
    },

    async getSeniorByCode(code) {
        try {
            const q = query(collection(db, SENIORS_COL), where("code", "==", code.toUpperCase()));
            const snap = await getDocs(q);
            if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
            throw new Error("Not found in Firestore");
        } catch (e) {
            const arr = await this.adminGetSeniors();
            return arr.find(s => s.code === code.toUpperCase()) || null;
        }
    },

    // Messages
    async getMessagesFor(toSeniorId) {
        try {
            const q = query(collection(db, MESSAGES_COL), where("to_senior_id", "==", toSeniorId));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            const s = localStorage.getItem(MOCK_MESSAGES_KEY);
            const all = s ? JSON.parse(s) : [];
            return all.filter(m => m.to_senior_id === toSeniorId);
        }
    },
    async addMessage(msg) {
        try {
            await addDoc(collection(db, MESSAGES_COL), { ...msg, timestamp: serverTimestamp() });
        } catch (e) {
            const s = localStorage.getItem(MOCK_MESSAGES_KEY);
            const all = s ? JSON.parse(s) : [];
            localStorage.setItem(MOCK_MESSAGES_KEY, JSON.stringify([...all, { ...msg, id: 'm' + Date.now() }]));
        }
    }
};
