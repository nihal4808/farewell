with open('src/components/MainDashboard.jsx', 'r') as f:
    content = f.read()

# I will find everything between <div ref={contentRef}> and </div> and just write it out fresh.

new_scrollable = """            <div ref={contentRef}>
                <section id="timeline" ref={timelineRef}>
                    {/* Section 2: Memory Gallery */}
                    <MemoryGallery />
                </section>

                {/* Divider */}
                <div style={{ width: '84px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', margin: '2rem auto' }} />

                <section id="chat" ref={chatRef}>
                    {/* Section: Archive Vault */}
                    <MediaVault />
                </section>

                {/* Divider */}
                <div style={{ width: '84px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', margin: '2rem auto' }} />

                <section id="work" ref={workRef}>
                    {/* Section 3: Autograph Wall */}
                    <AutographWall currentUser={user} />
                </section>

                {/* Divider */}
                <div style={{ width: '84px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-alt), transparent)', margin: '2rem auto' }} />

                <section id="code" ref={codeRef}>
                    {/* Section 4: Autograph Book */}
                    <AutographBook 
                        currentUser={user} 
                        onDownloadPDF={generatePDF} 
                        isGeneratingPDF={isGenerating} 
                    />
                </section>
                                
                {/* Divider */}
                <div style={{ width: '84px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-alt), transparent)', margin: '2rem auto' }} />

                <section id="wall" ref={wallRef}>
                    <GlobalWall currentUser={user} isActive={activeSection === "wall"} />
                </section>
            </div>"""

import re
content = re.sub(r'            <div ref=\{contentRef\}>[\s\S]*?            </div>', new_scrollable, content)

with open('src/components/MainDashboard.jsx', 'w') as f:
    f.write(content)
