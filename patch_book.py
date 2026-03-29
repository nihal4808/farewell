with open('src/components/AutographBook.jsx', 'r') as f:
    content = f.read()

# Make sure imports are there
if "Download" not in content and "Loader2" not in content:
    content = content.replace(
        "import { ChevronLeft, ChevronRight } from 'lucide-react';",
        "import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';"
    )

# Fix signature
content = content.replace("export default function AutographBook({ currentUser }) {", "export default function AutographBook({ currentUser, onDownloadPDF, isGeneratingPDF }) {")

# Update bottom div
old_div = """            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                <motion.button className="btn btn-secondary btn-icon" whileTap={{ scale: 0.9 }}
                    onClick={() => paginate(-1)} disabled={pageIndex === 0} style={{ opacity: pageIndex === 0 ? 0.3 : 1 }}>
                    <ChevronLeft size={22} />
                </motion.button>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Message {pageIndex + 1} of {messages.length}
                </span>
                <motion.button className="btn btn-secondary btn-icon" whileTap={{ scale: 0.9 }}
                    onClick={() => paginate(1)} disabled={pageIndex >= messages.length - 1} style={{ opacity: pageIndex >= messages.length - 1 ? 0.3 : 1 }}>
                    <ChevronRight size={22} />
                </motion.button>
            </div>"""

new_div = """            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 0', display: 'flex', minWidth: '150px' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                    <motion.button className="btn btn-secondary btn-icon" whileTap={{ scale: 0.9 }}
                        onClick={() => paginate(-1)} disabled={pageIndex === 0} style={{ opacity: pageIndex === 0 ? 0.3 : 1 }}>
                        <ChevronLeft size={22} />
                    </motion.button>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Message {pageIndex + 1} of {messages.length}
                    </span>
                    <motion.button className="btn btn-secondary btn-icon" whileTap={{ scale: 0.9 }}
                        onClick={() => paginate(1)} disabled={pageIndex >= messages.length - 1} style={{ opacity: pageIndex >= messages.length - 1 ? 0.3 : 1 }}>
                        <ChevronRight size={22} />
                    </motion.button>
                </div>
                
                <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', minWidth: '150px' }}>
                    {onDownloadPDF && (
                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onDownloadPDF}
                            disabled={isGeneratingPDF}
                            style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                        >
                            {isGeneratingPDF ? (
                                <><Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> Generating PDF...</>
                            ) : (
                                <><Download size={18} /> Download Book</>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>"""

content = content.replace(old_div, new_div)

with open('src/components/AutographBook.jsx', 'w') as f:
    f.write(content)

