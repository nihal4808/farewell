import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalLanding from './PersonalLanding';
import MemoryGallery from './MemoryGallery';
import AutographWall from './AutographWall';
import AutographBook from './AutographBook';
import GlobalWall from './GlobalWall';
import MediaVault from './MediaVault';
import FloatingDockNav from './FloatingDockNav';
import TopJourneyNav from './TopJourneyNav';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { mockDB } from '../data/mockDB';

export default function MainDashboard({ user }) {
    const contentRef = useRef(null);
    const homeRef = useRef(null);
    const timelineRef = useRef(null);
    const workRef = useRef(null);
    const codeRef = useRef(null);
    const wallRef = useRef(null);
    const chatRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const sections = [
            { id: 'home', ref: homeRef },
            { id: 'timeline', ref: timelineRef },
            { id: 'work', ref: workRef },
            { id: 'code', ref: codeRef },
            { id: 'wall', ref: wallRef },
            { id: 'chat', ref: chatRef }
        ];

        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visible[0]?.target?.id) {
                setActiveSection(visible[0].target.id);
            }
        }, {
            threshold: [0.25, 0.45, 0.65],
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(({ ref }) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const hash = (window.location.hash || '').replace('#', '').toLowerCase();
        const hashToSection = {
            home: 'home',
            timeline: 'timeline',
            wall: 'work',
            yearbook: 'code',
            vault: 'chat'
        };

        const targetSection = hashToSection[hash];
        if (!targetSection) return;

        const sectionRefs = {
            home: homeRef,
            timeline: timelineRef,
            work: workRef,
            code: codeRef,
            wall: wallRef,
            chat: chatRef
        };

        const timer = setTimeout(() => {
            sectionRefs[targetSection]?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 120);

        return () => clearTimeout(timer);
    }, []);

    const wrapCanvasText = (ctx, text, maxWidth) => {
        const paragraphs = (text || '').split('\n');
        const lines = [];
        for (const para of paragraphs) {
            if (!para.trim()) {
                lines.push('');
                continue;
            }
            const words = para.split(' ');
            let line = '';
            for (const word of words) {
                const testLine = line ? `${line} ${word}` : word;
                if (ctx.measureText(testLine).width > maxWidth && line) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) lines.push(line);
        }
        return lines;
    };

    const loadImage = (url) => new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });

    const renderMessageCanvas = async (msg) => {
        // Fixed pixel dimensions to keep export consistent on all devices.
        const width = 2400;
        const height = 1485;
        const leftW = Math.floor(width * 0.57);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Left page background
        ctx.fillStyle = '#f4eee2';
        ctx.fillRect(0, 0, leftW, height);

        // Right page background fallback
        ctx.fillStyle = '#d9d3c8';
        ctx.fillRect(leftW, 0, width - leftW, height);

        // Book spine
        ctx.fillStyle = '#c7bda9';
        ctx.fillRect(leftW - 6, 0, 12, height);

        // Right page photo
        const image = await loadImage(msg.from_photo_url);
        if (image) {
            const targetX = leftW;
            const targetY = 0;
            const targetW = width - leftW;
            const targetH = height;

            const imgRatio = image.width / image.height;
            const targetRatio = targetW / targetH;
            let drawW;
            let drawH;
            let drawX;
            let drawY;

            if (imgRatio > targetRatio) {
                drawH = targetH;
                drawW = drawH * imgRatio;
                drawX = targetX - (drawW - targetW) / 2;
                drawY = targetY;
            } else {
                drawW = targetW;
                drawH = drawW / imgRatio;
                drawX = targetX;
                drawY = targetY - (drawH - targetH) / 2;
            }

            ctx.drawImage(image, drawX, drawY, drawW, drawH);
        } else {
            ctx.fillStyle = '#c9c2b4';
            ctx.fillRect(leftW, 0, width - leftW, height);
            ctx.fillStyle = '#6e6659';
            ctx.font = '600 48px Georgia';
            ctx.textAlign = 'center';
            ctx.fillText('No photo shared', leftW + (width - leftW) / 2, height / 2);
        }

        // Left page title and text
        ctx.fillStyle = '#8b6914';
        ctx.font = '700 86px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(msg.from_name || 'Classmate', leftW / 2, 280);

        ctx.fillStyle = '#3a2a10';
        ctx.font = '500 48px Georgia';
        const textMaxWidth = leftW - 220;
        const lines = wrapCanvasText(ctx, msg.message_text || '', textMaxWidth);
        const lineHeight = 70;
        const startY = 470;
        for (let i = 0; i < lines.length; i += 1) {
            ctx.fillText(lines[i], leftW / 2, startY + i * lineHeight);
        }

        return canvas;
    };

    const scrollToContent = () => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const goToSection = (sectionId) => {
        const sectionRefs = {
            home: homeRef,
            timeline: timelineRef,
            work: workRef,
            code: codeRef,
            wall: wallRef,
            chat: chatRef
        };

        const sectionToHash = {
            home: 'home',
            timeline: 'timeline',
            work: 'wall',
            code: 'yearbook',
            chat: 'vault'
        };

        const nextHash = sectionToHash[sectionId];
        if (nextHash && window.location.hash !== `#${nextHash}`) {
            window.history.replaceState(null, '', `#${nextHash}`);
        }

        sectionRefs[sectionId]?.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const messages = await mockDB.getMessagesFor(user.id);
            // Fixed physical size (landscape) so export is identical on mobile and desktop.
            const PAGE_W_MM = 297;
            const PAGE_H_MM = 184;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_H_MM, PAGE_W_MM] });

            // Cover page
            pdf.setFillColor(10, 10, 15);
            pdf.rect(0, 0, PAGE_W_MM, PAGE_H_MM, 'F');
            pdf.setDrawColor(201, 168, 76);
            pdf.setLineWidth(0.8);
            pdf.rect(8, 8, PAGE_W_MM - 16, PAGE_H_MM - 16);
            pdf.setTextColor(201, 168, 76);
            pdf.setFontSize(34);
            pdf.text(user.name, PAGE_W_MM / 2, 70, { align: 'center' });
            pdf.setTextColor(165, 165, 178);
            pdf.setFontSize(16);
            pdf.text(`${user.department} · Class of ${user.batch_year}`, PAGE_W_MM / 2, 84, { align: 'center' });
            pdf.setTextColor(240, 235, 227);
            pdf.setFontSize(24);
            pdf.text('The Autograph Book', PAGE_W_MM / 2, 105, { align: 'center' });

            // Message pages (fixed canvas render)
            for (const msg of messages) {
                const canvas = await renderMessageCanvas(msg);
                const imageData = canvas.toDataURL('image/jpeg', 0.95);
                pdf.addPage([PAGE_H_MM, PAGE_W_MM], 'landscape');
                pdf.addImage(imageData, 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM, undefined, 'FAST');
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
            <TopJourneyNav activeSection={activeSection} onNavigate={goToSection} />

            <section id="home" ref={homeRef}>
                {/* Section 1: Personal Landing */}
                <PersonalLanding senior={user} onScrollDown={scrollToContent} />
            </section>

            {/* Scrollable content */}
            <div ref={contentRef}>
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

                <section id="wall" ref={wallRef}>
                    <GlobalWall currentUser={user} isActive={activeSection === "wall"} />
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
            </div>

            <FloatingDockNav activeSection={activeSection} onNavigate={goToSection} />
        </motion.div>
    );
}
