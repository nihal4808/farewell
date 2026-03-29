with open('src/data/mockDB.js', 'r') as f:
    content = f.read()

content = content.replace("    }\n\n    async getWallMessages", "    },\n\n    async getWallMessages")
content = content.replace("    }\n    async getWallMessages", "    },\n    async getWallMessages")

with open('src/data/mockDB.js', 'w') as f:
    f.write(content)
