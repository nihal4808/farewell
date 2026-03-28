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

export const mockDB = {
    async getSettings() {
        const s = localStorage.getItem(MOCK_SETTINGS_KEY);
        return s ? JSON.parse(s) : MOCK_SETTINGS_DEFAULT;
    },
    async adminGetSeniors() {
        const s = localStorage.getItem(MOCK_SENIORS_KEY);
        return s ? JSON.parse(s) : MOCK_SENIORS_DEFAULT;
    },
    async getSeniorByCode(code) {
        const arr = await this.adminGetSeniors();
        return arr.find(s => s.code === code.toUpperCase()) || null;
    },
    async getMessagesFor(toSeniorId) {
        const s = localStorage.getItem(MOCK_MESSAGES_KEY);
        const all = s ? JSON.parse(s) : [];
        return all.filter(m => m.to_senior_id === toSeniorId);
    }
};
