import { motion } from 'framer-motion';
import { UserRound, Image as ImageIcon, PenSquare, FolderOpen } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'timeline', label: 'The Journey', icon: ImageIcon },
    { id: 'chat', label: 'Media Vault', icon: FolderOpen },
    { id: 'work', label: 'Yearbook', icon: PenSquare },
    { id: 'wall', label: 'The Wall', icon: UserRound }
];

export default function FloatingDockNav({ activeSection, onNavigate }) {
    return (
        <motion.nav
            className="dock-nav"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                    <button
                        key={item.id}
                        type="button"
                        className={`dock-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        aria-label={item.label}
                    >
                        {isActive && (
                            <motion.span
                                className="dock-slide-indicator"
                                layoutId="dock-slide-indicator"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            />
                        )}
                        <Icon size={26} strokeWidth={2.1} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </motion.nav>
    );
}