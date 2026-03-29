import re

with open('src/components/GlobalWall.jsx', 'r') as f:
    text = f.read()

modal_start = text.find('className="card"')
modal_end = text.find('</AnimatePresence>')

# We will just rewrite the modal part inside `isWriting &&` block
# Let's write a python script that carefully replaces that part.
