import sys
import re

def run():
    with open('src/components/GlobalWall.jsx', 'r') as f:
        content = f.read()

    # Change function signature
    content = content.replace('export default function GlobalWall({ currentUser }) {', 'export default function GlobalWall({ currentUser, isActive }) {')

    # Change the button to be wrapped in AnimatePresence and isActive check
    button_match = r"<motion\.button\s+whileHover={{ scale: 1\.05 }}\s+whileTap={{ scale: 0\.95 }}\s+onClick={\(\) => setIsWriting\(true\)}.*?</motion\.button>"
    
    # We will just replace it by searching for <motion.button that has Write a Message
    old_btn = """            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWriting(true)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    padding: '1rem 1.5rem',
                    borderRadius: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(236,187,75,0.3)',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                <PenTool size={20} />
                Write a Message
            </motion.button>"""

    new_btn = """            <AnimatePresence>
                {isActive && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsWriting(true)}
                        style={{
                            position: 'fixed',
                            bottom: '6rem', // raised slightly to clear the dock on mobile
                            right: '2rem',
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            padding: '1rem 1.5rem',
                            borderRadius: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 700,
                            boxShadow: '0 10px 25px rgba(236,187,75,0.3)',
                            cursor: 'pointer',
                            zIndex: 100
                        }}
                    >
                        <PenTool size={20} />
                        Write a Message
                    </motion.button>
                )}
            </AnimatePresence>"""

    if old_btn in content:
        content = content.replace(old_btn, new_btn)
    else:
        print("Could not find the button to replace")

    with open('src/components/GlobalWall.jsx', 'w') as f:
        f.write(content)

run()
