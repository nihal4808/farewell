import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalLanding from './PersonalLanding';
import MemoryGallery from './MemoryGallery';
import AutographWall from './AutographWall';
import AutographBook from './AutographBook';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { mockDB } from '../data/mockDB';

export default function MainDashboard({ user }) {
    const contentRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const messages = await mockDB.getMessagesFor(user.id);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = 210, H = 297;

            // Cover Page
            pdf.setFillColor(10, 10, 15); // Dark BG
            pdf.rect(0, 0, W, H, 'F');

            // Border lines
            pdf.setDrawColor(201, 168, 76); // Gold
            pdf.setLineWidth(1);
            pdf.rect(10, 10, W - 20, H - 20);

            // Senior Name
            pdf.setTextColor(201, 168, 76);
            pdf.setFontSize(28);
            pdf.text(user.name, W / 2, 80, { align: 'center' });

            pdf.setFontSize(14);
            pdf.setTextColor(138, 138, 154);
            pdf.text(`${user.department} · Class of ${user.batch_year}`, W / 2, 92, { align: 'center' });

            pdf.setFontSize(20);
            pdf.setTextColor(240, 235, 227);
            pdf.text('The Autograph Book', W / 2, 120, { align: 'center' });

            // Messages
            for (const msg of messages) {
                pdf.addPage();
                // Page style: light paper
                pdf.setFillColor(250, 246, 238);
                pdf.rect(0, 0, W, H, 'F');

                pdf.setDrawColor(139, 105, 20); // Darker gold for border
                pdf.setLineWidth(0.5);
                pdf.rect(10, 10, W - 20, H - 20);

                // From Name
                pdf.setTextColor(139, 105, 20);
                pdf.setFontSize(22);
                pdf.text(msg.from_name, W / 2, 40, { align: 'center' });

                // Message Text
                pdf.setTextColor(58, 42, 16);
                pdf.setFontSize(12);
                const splitText = pdf.splitTextToSize(msg.message_text, W - 40);
                pdf.text(splitText, 20, 60);

                // Photo if available
                if (msg.from_photo_url && msg.from_photo_url.startsWith('data:image')) {
                    try {
                        pdf.addImage(msg.from_photo_url, 'JPEG', 40, 150, 130, 97);
                    } catch (e) {
                        console.error('Could not add image to PDF:', e);
                    }
                }
            }

            pdf.save(`${user.name.replace(/\s+/g, '_')}_AutographBook.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF. Check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%' }}
        >
            {/* Section 1: Personal Landing */}
            <PersonalLanding senior={user} onScrollDown={scrollToContent} />

            {/* Scrollable content */}
            <div ref={contentRef}>
                {/* Section 2: Memory Gallery */}
                <MemoryGallery />

                {/* Divider */}
                <div style={{ width: '60px', height: '2px', background: 'var(--accent-dim)', margin: '2rem auto' }} />

                {/* Section 3: Autograph Wall */}
                <AutographWall currentUser={user} />

                {/* Divider */}
                <div style={{ width: '60px', height: '2px', background: 'var(--accent-dim)', margin: '2rem auto' }} />

                {/* Section 4: Autograph Book */}
                <AutographBook currentUser={user} />

                {/* Section 5: PDF Download */}
                <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
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
                </section>
            </div>
        </motion.div>
    );
}
