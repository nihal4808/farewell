import sys

def run():
    with open('src/components/MainDashboard.jsx', 'r') as f:
        content = f.read()

    # Import GlobalWall
    if "import GlobalWall from './GlobalWall';" not in content:
        content = content.replace("import AutographBook from './AutographBook';", "import AutographBook from './AutographBook';\nimport GlobalWall from './GlobalWall';")

    # Add wallRef
    if "const wallRef = useRef(null);" not in content:
        content = content.replace("const codeRef = useRef(null);", "const codeRef = useRef(null);\n    const wallRef = useRef(null);")

    # Add to sections array
    if "{ id: 'wall', ref: wallRef }" not in content:
        content = content.replace("{ id: 'code', ref: codeRef },", "{ id: 'code', ref: codeRef },\n            { id: 'wall', ref: wallRef },")

    # Add to sectionRefs mapping
    if "wall: wallRef," not in content:
        content = content.replace("code: codeRef,", "code: codeRef,\n            wall: wallRef,")

    # Insert section wall before chat
    wall_section = """
                {/* Divider */}
                <div style={{ width: '84px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-alt), transparent)', margin: '2rem auto' }} />

                <section id="wall" ref={wallRef}>
                    <GlobalWall currentUser={user} />
                </section>
"""
    if 'id="wall" ref={wallRef}' not in content:
        content = content.replace('<section id="chat" ref={chatRef}>', wall_section + '\n                <section id="chat" ref={chatRef}>')

    with open('src/components/MainDashboard.jsx', 'w') as f:
        f.write(content)

run()
