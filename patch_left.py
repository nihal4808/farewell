import re

with open('src/components/AutographBook.jsx', 'r') as f:
    content = f.read()

old_left = """                        <div className="book-page book-page-left">
                            <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#7be0ff', marginBottom: '1.5rem' }}>
                                {msg.from_name}
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: '#e7efff', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                                {msg.message_text}
                            </p>
                        </div>"""

new_left = """                        <div className="book-page book-page-left-note">
                            <div className="note-tape"></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <p className="font-script" style={{ fontSize: '1.8rem', color: '#2c2c2c', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                    "{msg.message_text}"
                                </p>
                            </div>
                            <div style={{ width: '100%', borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'left' }}>
                                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>
                                    {msg.from_name}
                                </h2>
                            </div>
                        </div>"""

if old_left in content:
    content = content.replace(old_left, new_left)

with open('src/components/AutographBook.jsx', 'w') as f:
    f.write(content)
