import sys

with open('src/data/mockDB.js', 'r') as f:
    text = f.read()

if "WALL_COL" not in text.split('async getWallMessages')[0]:
    text = text.replace("export const MOCK_MESSAGES_KEY = 'hw_mock_messages';", "export const MOCK_MESSAGES_KEY = 'hw_mock_messages';\nexport const MOCK_WALL_KEY = 'hw_mock_wall';\nexport const WALL_COL = 'public_wall';")
    with open('src/data/mockDB.js', 'w') as f:
        f.write(text)
    print("Fixed constants")

