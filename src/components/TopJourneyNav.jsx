import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { id: 'timeline', label: 'The Journey' },
    { id: 'work', label: 'Yearbook' },
    { id: 'wall', label: 'The Wall' },
    { id: 'chat', label: 'Media Vault' }
];

export default function TopJourneyNav({ activeSection, onNavigate }) {
    return (
        <motion.header
            className="top-journey-nav"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
        >
            <div className="top-journey-brand">
                <span className="top-journey-logo">◌</span>
                <span>Batch '26</span>
            </div>

            <nav className="top-journey-links">
                {NAV_ITEMS.map((item) => {
                    const active = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`top-journey-link ${active ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </motion.header>
    );
}