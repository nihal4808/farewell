import sys

def run():
    with open('src/components/FloatingDockNav.jsx', 'r') as f:
        content = f.read()

    new_nav = """const NAV_ITEMS = [
    { id: 'timeline', label: 'The Journey', icon: ImageIcon },
    { id: 'work', label: 'Yearbook', icon: PenSquare },
    { id: 'wall', label: 'The Wall', icon: UserRound },
    { id: 'chat', label: 'Media Vault', icon: FolderOpen }
];"""
    
    import re
    content = re.sub(r'const NAV_ITEMS = \[.*?\];', new_nav, content, flags=re.DOTALL)
    
    with open('src/components/FloatingDockNav.jsx', 'w') as f:
        f.write(content)

run()
