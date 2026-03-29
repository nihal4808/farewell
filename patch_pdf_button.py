with open('src/components/MainDashboard.jsx', 'r') as f:
    content = f.read()

# Extract the button block
pdf_block = """                    <div className="card" style={{ maxWidth: 760, margin: '2rem auto 6rem', padding: '2rem 1.5rem', textAlign: 'center' }}>
                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={generatePDF}
                            disabled={isGenerating}
                            style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}
                        >
                            {isGenerating ? (
                                <><Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} /> Generating PDF...</>
                            ) : (
                                <><Download size={20} /> Download Your Autograph Book</>
                            )}
                        </motion.button>
                        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Saves as a PDF — one message per page
                        </p>
                    </div>"""

# Remove it from under MediaVault
content = content.replace(pdf_block, "")

# Add it under AutographBook
if "<AutographBook currentUser={user} />" in content:
    content = content.replace(
        "<AutographBook currentUser={user} />",
        "<AutographBook currentUser={user} />\n" + pdf_block
    )

with open('src/components/MainDashboard.jsx', 'w') as f:
    f.write(content)
