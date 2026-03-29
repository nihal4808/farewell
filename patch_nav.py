with open('src/components/FloatingDockNav.jsx', 'r') as f:
    content = f.read()

old_nav = """const NAV_ITEMS = [
    { id: 'timeline', label: 'The Journey', icon: ImageIcon },
    { id: 'work', label: 'Yearbook', icon: PenSquare },
    { id: 'wall', label: 'The Wall', icon: UserRound },
    { id: 'chat', label: 'Media Vault', icon: FolderOpen }
];"""

new_nav = """const NAV_ITEMS = [
    { id: 'timeline', label: 'The Journey', icon: ImageIcon },
    { id: 'chat', label: 'Media Vault', icon: FolderOpen },
    { id: 'work', label: 'Yearbook', icon: PenSquare },
    { id: 'wall', label: 'The Wall', icon: UserRound }
];"""

content = content.replace(old_nav, new_nav)

with open('src/components/FloatingDockNav.jsx', 'w') as f:
    f.write(content)
