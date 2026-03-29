with open('src/components/MainDashboard.jsx', 'r') as f:
    content = f.read()

chat_block = """                <section id="chat" ref={chatRef}>
                    <MediaVault />

                </section>"""

# remove old chat block
if chat_block in content:
    content = content.replace(chat_block, "")

# Add chat block before work block with a divider
work_marker = """                <section id="work" ref={workRef}>
                    {/* Section 3: Autograph Wall */}
                    <AutographWall currentUser={user} />
                </section>"""

new_chat_with_divider = """                <section id="chat" ref={chatRef}>
                    {/* Section: Archive Vault */}
                    <MediaVault />
                </section>

                {/* Divider */}
                <div style={{ width: '84px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', margin: '2rem auto' }} />

""" + work_marker

content = content.replace(work_marker, new_chat_with_divider)

with open('src/components/MainDashboard.jsx', 'w') as f:
    f.write(content)
