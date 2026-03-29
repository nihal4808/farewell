import re

with open('src/components/AutographWall.jsx', 'r') as f:
    content = f.read()

# Replace lucide-react imports
content = content.replace("import { PenTool, X, Send, Upload } from 'lucide-react';", "import { PenTool, X, Send, Upload, Search } from 'lucide-react';")

# Add state variables
state_vars = """    const [seniors, setSeniors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('All Majors');"""
content = content.replace("    const [seniors, setSeniors] = useState([]);", state_vars)

# Find render section and replace it
render_start = content.find('    return (')
render_end = content.find('            {/* Message Modal */}')

new_render = """    const MAJORS = ['All Majors', 'CSE', 'CSE(AIDS)', 'CSE(CYBER)', 'MECH', 'CIVIL', 'EC', 'EX'];

    const filteredSeniors = seniors.filter(s => {
        if (s.id === currentUser?.id) return false;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMajor = selectedMajor === 'All Majors' || s.department === selectedMajor;
        return matchesSearch && matchesMajor;
    });

    const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVars = { hidden: { opacity: 0, y: 30, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18 } } };

    return (
        <section style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
            
            <div className="wall-controls">
                <div className="wall-search">
                    <Search size={16} color="#888" />
                    <input 
                        type="text" 
                        placeholder="Find a classmate..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="wall-filters">
                    {MAJORS.map(major => (
                        <button 
                            key={major}
                            className={`wall-filter-btn ${selectedMajor === major ? 'active' : ''}`}
                            onClick={() => setSelectedMajor(major)}
                        >
                            {major}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div className="wall-grid" variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {filteredSeniors.map(senior => {
                    const initials = senior.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                        <motion.div key={senior.id} variants={itemVars} className="wall-card" onClick={() => openModal(senior)}>
                            <div className="wall-card-bg">
                                {senior.photo_url && senior.photo_url !== 'https://i.pravatar.cc/200' ? (
                                    <img src={senior.photo_url} alt={senior.name} loading="lazy" />
                                ) : (
                                    <div className="wall-card-initials">{initials}</div>
                                )}
                            </div>
                            <div className="wall-card-overlay"></div>
                            
                            <div className="wall-card-hover-btn">
                                OPEN YEARBOOK
                            </div>

                            <div className="wall-card-info">
                                <h3 className="wall-card-name">{senior.name}</h3>
                                <div className="wall-card-meta">
                                    <span className="wall-card-dept">{senior.department?.toUpperCase() || 'CSE'}</span>
                                    <span className="wall-card-code">{senior.code || senior.id}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

"""

# We need to correctly slice it because I am replacing the header and the motion.div grid-wall.
# Let's find exactly what to slice.
import textwrap

f1 = content[:render_start]
f3 = content[render_end:]

with open('src/components/AutographWall.jsx', 'w') as f:
    f.write(f1 + new_render + f3)

