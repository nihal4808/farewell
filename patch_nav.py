import sys

def patch_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    new_nav = """const NAV_ITEMS = [
    { id: 'timeline', label: 'The Journey' },
    { id: 'work', label: 'Yearbook' },
    { id: 'wall', label: 'The Wall' },
    { id: 'chat', label: 'Media Vault' }
];"""
    
    # We replace from "const NAV_ITEMS = [" down to "];"
    import re
    content = re.sub(r'const NAV_ITEMS = \[.*?\];', new_nav, content, flags=re.DOTALL)
    
    with open(filename, 'w') as f:
        f.write(content)

patch_file('src/components/TopJourneyNav.jsx')
patch_file('src/components/FloatingDockNav.jsx')
