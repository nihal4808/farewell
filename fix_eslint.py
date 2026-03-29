with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# Fix saveSeniors
content = content.replace("    const saveSeniors = async (data) => {\n        await mockDB.saveSeniors(data);\n        setSeniors(data);\n    };", "")

# Fix clearCropSource
content = content.replace("    const clearCropSource = () => {\n        if (typeof cropState.source === 'string' && cropState.source.startsWith('blob:')) {\n            URL.revokeObjectURL(cropState.source);\n        }\n    };", "")

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)

