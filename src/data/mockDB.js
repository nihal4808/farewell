import { db } from '../lib/firebase';
import { compressDataUrlToMaxBytes, estimateDataUrlBytes } from '../lib/compressDataUrl';
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
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

export const MOCK_SETTINGS_KEY = 'hw_mock_settings';
export const MOCK_SENIORS_KEY = 'hw_mock_seniors';
export const MOCK_MESSAGES_KEY = 'hw_mock_messages';
export const MOCK_WALL_KEY = 'hw_mock_wall';
export const WALL_COL = 'public_wall';
export const MOCK_MEMORIES_KEY = 'hw_mock_memories';

export const MOCK_SETTINGS_DEFAULT = {
    department: 'AI & Data Science',
    batch_year: '2026',
    autograph_open: true
};

export const MOCK_SENIORS_DEFAULT = [
    { id: 's1', name: 'Amira Hassan', department: 'AI & Data Science', batch_year: '2026', code: 'AMH001', photo_url: 'https://i.pravatar.cc/200?img=1' },
    { id: 's2', name: 'Bilal Qureshi', department: 'AI & Data Science', batch_year: '2026', code: 'BLQ002', photo_url: 'https://i.pravatar.cc/200?img=3' },
];

export const MOCK_MEMORIES_DEFAULT = [
    { id: 'm1', title: 'Our first day together', photo_url: 'https://picsum.photos/seed/farewell1/600/450' },
    { id: 'm2', title: 'Late-night study sessions', photo_url: 'https://picsum.photos/seed/farewell2/600/450' },
    { id: 'm3', title: 'Annual fest highlights', photo_url: 'https://picsum.photos/seed/farewell3/600/450' },
    { id: 'm4', title: 'Project expo moments', photo_url: 'https://picsum.photos/seed/farewell4/600/450' },
];

// Collection Names
const SETTINGS_COL = 'settings';
const SENIORS_COL = 'seniors';
const MESSAGES_COL = 'messages';

export const MOCK_VAULT_KEY = 'hw_mock_vault';
export const MOCK_VAULT_DEFAULT = [
    { id: 'v1', category: 'All Memories', title: 'The Starting Line', date: 'Fall 2022', photo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600' },
    { id: 'v2', category: '1st yr', title: 'First Hackathon', date: 'Winter 2022', photo_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600' },
];
const VAULT_COL = 'vault';

const MEMORIES_COL = 'memories';
const MAX_PHOTO_DATA_URL_BYTES = 750 * 1024; // Pushed close to 1MB Firestore limit for higher quality
const READ_TIMEOUT_MS = 6000;
const WRITE_TIMEOUT_MS = 20000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryWrite = (error) => {
    const text = String(error?.code || error?.message || '').toLowerCase();
    return [
        'timeout',
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted',
        'network',
        'aborted',
        'internal'
    ].some(token => text.includes(token));
};

const normalizePhotoForStorage = async (value) => {
    if (!value || typeof value !== 'string' || !value.startsWith('data:image/')) return value;

    if (estimateDataUrlBytes(value) <= MAX_PHOTO_DATA_URL_BYTES) {
        return value;
    }

    const compressed = await compressDataUrlToMaxBytes(value, MAX_PHOTO_DATA_URL_BYTES, {
        initialMaxEdge: 1600,
        minEdge: 800,
        initialQuality: 0.90,
        minQuality: 0.5,
        resizeStep: 0.85,
        qualityStep: 0.05,
        maxPasses: 8
    });

    if (estimateDataUrlBytes(compressed) <= MAX_PHOTO_DATA_URL_BYTES) {
        return compressed;
    }

    // Final aggressive pass for stubborn large images on low-end mobile devices.
    const compressedAggressive = await compressDataUrlToMaxBytes(compressed, MAX_PHOTO_DATA_URL_BYTES, {
        initialMaxEdge: 760,
        minEdge: 320,
        initialQuality: 0.62,
        minQuality: 0.28,
        resizeStep: 0.78,
        qualityStep: 0.1,
        maxPasses: 10
    });

    if (estimateDataUrlBytes(compressedAggressive) <= MAX_PHOTO_DATA_URL_BYTES) {
        return compressedAggressive;
    }

    // If it still exceeds limits, drop the photo rather than failing the entire save.
    return '';

};

const withWriteTimeout = (promise) => withTimeout(promise, WRITE_TIMEOUT_MS);
const withReadTimeout = (promise) => withTimeout(promise, READ_TIMEOUT_MS);

const withWriteRetry = async (operation, retries = 2) => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await withWriteTimeout(operation());
        } catch (error) {
            lastError = error;
            if (attempt === retries || !shouldRetryWrite(error)) {
                break;
            }
            await sleep(500 * (2 ** attempt));
        }
    }

    throw lastError;
};

const getMessageTime = (msg) => {
    const t = msg?.updated_at || msg?.timestamp || msg?.created_at;
    if (!t) return 0;
    if (typeof t === 'number') return t;
    if (t instanceof Date) return t.getTime();
    if (typeof t?.toMillis === 'function') return t.toMillis();
    if (typeof t?.seconds === 'number') return (t.seconds * 1000) + Math.floor((t.nanoseconds || 0) / 1e6);
    const parsed = Date.parse(t);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const dedupeLatestMessages = (messages, keyFn) => {
    const map = new Map();

    messages.forEach((msg) => {
        const key = keyFn(msg);
        const existing = map.get(key);
        if (!existing || getMessageTime(msg) >= getMessageTime(existing)) {
            map.set(key, msg);
        }
    });

    return Array.from(map.values()).sort((a, b) => getMessageTime(b) - getMessageTime(a));
};

// Timeout wrapper to prevent hangs with invalid Firebase config
const withTimeout = (promise, ms = READ_TIMEOUT_MS) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), ms))
    ]);
};


export const mockDB = {

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

    // Settings
    
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
                const docRef = await withWriteTimeout(addDoc(collection(db, WALL_COL), msg));
                msg.id = docRef.id;
            } catch (e) {
                console.warn('Add wall message failed, falling back offline', e);
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

    async getSettings() {
        try {
            const docRef = doc(db, SETTINGS_COL, 'global');
            const snap = await withReadTimeout(getDoc(docRef));
            if (snap.exists()) return snap.data();
            return MOCK_SETTINGS_DEFAULT;
        } catch (e) {
            console.warn("Firebase fallback triggered for settings.", e.message);
            const s = localStorage.getItem(MOCK_SETTINGS_KEY);
            return s ? JSON.parse(s) : MOCK_SETTINGS_DEFAULT;
        }
    },
    async saveSettings(data) {
        const docRef = doc(db, SETTINGS_COL, 'global');
        await withWriteRetry(() => updateDoc(docRef, data)).catch(() => withWriteRetry(() => addDoc(collection(db, SETTINGS_COL), { ...data, id: 'global' })));
        localStorage.setItem(MOCK_SETTINGS_KEY, JSON.stringify(data));
    },

    // Seniors
    async adminGetSeniors() {
        try {
            const q = query(collection(db, SENIORS_COL));
            const snap = await withReadTimeout(getDocs(q));
            if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            throw new Error("Empty Firestore");
        } catch (e) {
            console.log("Using localStorage fallback for seniors:", e.message);
            const s = localStorage.getItem(MOCK_SENIORS_KEY);
            return s ? JSON.parse(s) : MOCK_SENIORS_DEFAULT;
        }
    },
    async addSenior(senior) {
        const safeSenior = {
            ...senior,
            photo_url: await normalizePhotoForStorage(senior?.photo_url)
        };
        try {
            await withWriteRetry(() => addDoc(collection(db, SENIORS_COL), { ...safeSenior, created_at: serverTimestamp() }));
        } catch (e) {
            console.error('Failed to add senior to Firestore:', e.message);
            throw new Error('Could not save senior. Please check network and try again.');
        }
    },
    async updateSenior(id, data) {
        const safeData = {
            ...data,
            photo_url: await normalizePhotoForStorage(data?.photo_url)
        };
        try {
            const docRef = doc(db, SENIORS_COL, id);
            await withWriteRetry(() => updateDoc(docRef, safeData));
        } catch (e) {
            console.error('Failed to update senior in Firestore:', e.message);
            throw new Error('Could not update senior. Please try again.');
        }
    },
    async deleteSenior(id) {
        try {
            await withWriteRetry(() => deleteDoc(doc(db, SENIORS_COL, id)));
        } catch (e) {
            console.error('Failed to delete senior in Firestore:', e.message);
            throw new Error('Could not delete senior. Please try again.');
        }
    },

    async getSeniorByCode(code) {
        try {
            const q = query(collection(db, SENIORS_COL), where("code", "==", code.toUpperCase()));
            const snap = await withReadTimeout(getDocs(q));
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
            const snap = await withReadTimeout(getDocs(q));
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return dedupeLatestMessages(all, (m) => `${m.from_senior_id || m.from_name || 'unknown'}::${m.to_senior_id || ''}`);
        } catch (e) {
            const s = localStorage.getItem(MOCK_MESSAGES_KEY);
            const all = s ? JSON.parse(s) : [];
            const filtered = all.filter(m => m.to_senior_id === toSeniorId);
            return dedupeLatestMessages(filtered, (m) => `${m.from_senior_id || m.from_name || 'unknown'}::${m.to_senior_id || ''}`);
        }
    },
    async addMessage(msg) {
        const safeMsg = {
            ...msg,
            from_photo_url: await normalizePhotoForStorage(msg?.from_photo_url)
        };
        const payload = {
            ...safeMsg,
            timestamp: serverTimestamp(),
            updated_at: serverTimestamp()
        };

        try {
            const canUpsertPair = Boolean(safeMsg?.from_senior_id && safeMsg?.to_senior_id);
            if (!canUpsertPair) {
                await withWriteRetry(() => addDoc(collection(db, MESSAGES_COL), payload));
                return;
            }

            const pairQuery = query(
                collection(db, MESSAGES_COL),
                where("from_senior_id", "==", safeMsg.from_senior_id),
                where("to_senior_id", "==", safeMsg.to_senior_id)
            );
            const existing = await withReadTimeout(getDocs(pairQuery));

            if (existing.empty) {
                await withWriteRetry(() => addDoc(collection(db, MESSAGES_COL), payload));
                return;
            }

            const [primary, ...duplicates] = existing.docs;
            await withWriteRetry(() => updateDoc(doc(db, MESSAGES_COL, primary.id), payload));

            if (duplicates.length > 0) {
                await Promise.all(duplicates.map(d => withWriteRetry(() => deleteDoc(doc(db, MESSAGES_COL, d.id)))));
            }
        } catch (e) {
            console.error('Failed to save message to Firestore:', e.message);
            throw new Error('Could not send message. Please check network and try again.');
        }
    },

    async adminGetAllMessages() {
        try {
            const snap = await withReadTimeout(getDocs(collection(db, MESSAGES_COL)));
            
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return dedupeLatestMessages(all, (m) => `${m.from_senior_id || m.from_name || 'unknown'}::${m.to_senior_id || 'unknown'}`);
        } catch (e) {
            const s = localStorage.getItem(MOCK_MESSAGES_KEY);
            const all = s ? JSON.parse(s) : [];
            return dedupeLatestMessages(all, (m) => `${m.from_senior_id || m.from_name || 'unknown'}::${m.to_senior_id || 'unknown'}`);
        }
    },

    async deleteMessage(id) {
        try {
            await withWriteRetry(() => deleteDoc(doc(db, MESSAGES_COL, id)));
        } catch (e) {
            console.error('Failed to delete message from Firestore:', e.message);
            throw new Error('Could not delete message. Please try again.');
        }
    },

    // Memories
    async getAllMemories() {
        try {
            const snap = await withReadTimeout(getDocs(collection(db, MEMORIES_COL)));
            if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            throw new Error('No memories in Firestore');
        } catch (e) {
            const s = localStorage.getItem(MOCK_MEMORIES_KEY);
            return s ? JSON.parse(s) : MOCK_MEMORIES_DEFAULT;
        }
    },

    async addMemory(memory) {
        const safeMemoryPhoto = await normalizePhotoForStorage(memory?.photo_url);
        const payload = {
            title: memory.title || '',
            caption: memory.caption || memory.title || '',
            photo_url: safeMemoryPhoto || '',
            uploaded_at: serverTimestamp()
        };

        try {
            await withWriteRetry(() => addDoc(collection(db, MEMORIES_COL), payload));
        } catch (e) {
            console.error('Failed to add memory to Firestore:', e.message);
            throw new Error('Could not upload memory. Please check network and photo size.');
        }
    },

    async deleteMemory(id) {
        try {
            await withWriteRetry(() => deleteDoc(doc(db, MEMORIES_COL, id)));
        } catch (e) {
            console.error('Failed to delete memory from Firestore:', e.message);
            throw new Error('Could not delete memory. Please try again.');
        }
    }
};
