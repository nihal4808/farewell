import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mockDB } from '../data/mockDB';

const TIMELINE_DEFAULT = [
    {
        id: 't1',
        year: '2022',
        title: 'The First Hello',
        blurb: 'First day on campus: lost, nervous, and already becoming a family.',
        photo_url: 'https://picsum.photos/seed/campus2022/700/460'
    },
    {
        id: 't2',
        year: '2023',
        title: 'We Became The Seniors',
        blurb: 'Freshers night, rehearsals, and all the chaos we secretly loved.',
        photo_url: 'https://picsum.photos/seed/seniors2023/700/460'
    },
    {
        id: 't3',
        year: '2024',
        title: 'Finding Our Feet',
        blurb: 'Assignments, projects, and coffee-fueled library marathons.',
        photo_url: 'https://picsum.photos/seed/library2024/700/460'
    },
    {
        id: 't4',
        year: '2025',
        title: 'A Goodbye Worth Remembering',
        blurb: 'We gave our seniors the send-off they deserved, with all our heart.',
        photo_url: 'https://picsum.photos/seed/farewell2025/700/460'
    },
    {
        id: 't5',
        year: '2026',
        title: 'The Next Chapter',
        blurb: 'Four years. Countless memories. One unforgettable class.',
        photo_url: 'https://picsum.photos/seed/grad2026/700/460'
    }
];

export default function MemoryGallery() {
    const [timeline, setTimeline] = useState(TIMELINE_DEFAULT);
    const finalIndex = timeline.length - 1;

    useEffect(() => {
        mockDB.getAllMemories().then((dbMemories) => {
            if (!Array.isArray(dbMemories) || dbMemories.length === 0) {
                setTimeline(TIMELINE_DEFAULT);
                return;
            }

            const yearStart = 2022;
            const mapped = dbMemories.slice(0, 5).map((item, index) => ({
                id: item.id || `mem-${index}`,
                year: String(yearStart + index),
                title: item.title || `Chapter ${index + 1}`,
                blurb: item.caption || 'A special memory from our journey.',
                photo_url: item.photo_url || TIMELINE_DEFAULT[index % TIMELINE_DEFAULT.length].photo_url
            }));

            setTimeline(mapped);
        }).catch(() => setTimeline(TIMELINE_DEFAULT));
    }, []);

    return (
        <section className="journey-section">
            <div className="journey-shell">
                <span className="journey-kicker">Our History</span>
                <h2 className="journey-heading font-display">The Journey: 2022-2026</h2>
                <div className="journey-timeline-line" />

                {timeline.map((item, index) => (
                    <motion.article
                        key={item.id}
                        className={`journey-row ${index % 2 === 1 ? 'journey-row-reverse' : ''} ${index === finalIndex ? 'journey-row-final' : ''}`}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                    >
                        <div className="journey-year">{item.year}</div>

                        <motion.div
                            className="journey-polaroid"
                            style={{ transform: `rotate(${index % 2 ? -1.1 : 1.1}deg)` }}
                            whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        >
                            <div className="journey-polaroid-image-wrap">
                                <img src={item.photo_url} alt={item.title} loading="lazy" />
                            </div>
                            <p className="journey-polaroid-caption">
                                {index === finalIndex ? "We made it. Class of '26." : `${item.blurb.split('.')[0]}.`}
                            </p>
                        </motion.div>

                        {index !== finalIndex ? (
                            <div className="journey-copy">
                                <h3 className="journey-title font-display">{item.title}</h3>
                                <p className="journey-text">{item.blurb}</p>
                            </div>
                        ) : null}
                    </motion.article>
                ))}

                <p className="journey-closing font-display">
                    Four years. Countless memories. One unforgettable journey.
                    <br />
                    This is not the end, it is just the beginning.
                </p>
            </div>
        </section>
    );
}
