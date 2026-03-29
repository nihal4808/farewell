import re

with open('src/data/mockDB.js', 'r') as f:
    content = f.read()

del_wall_msg_code = """
    async deleteWallMessage(messageId) {
        if (true) {
            try {
                await deleteDoc(doc(db, WALL_COL, messageId));
                console.log('Wall message deleted from Firebase');
                
                // Also update localStorage
                try {
                    const localData = localStorage.getItem('wall_messages');
                    if (localData) {
                        const messages = JSON.parse(localData);
                        const updated = messages.filter(m => m.id !== messageId);
                        localStorage.setItem('wall_messages', JSON.stringify(updated));
                    }
                } catch (e) {
                    // Ignore local storage error
                }
                
                return true;
            } catch (error) {
                console.error("Error deleting wall message from Firebase: ", error);
                
                // Fallback to local storage only
                try {
                    const localData = localStorage.getItem('wall_messages');
                    if (localData) {
                        const messages = JSON.parse(localData);
                        const updated = messages.filter(m => m.id !== messageId);
                        localStorage.setItem('wall_messages', JSON.stringify(updated));
                        return true;
                    }
                } catch (e) {
                    console.error("Error with local storage fallback deletion: ", e);
                }
                return false;
            }
        }
    }
"""

if "deleteWallMessage" not in content:
    content = content.replace("async getWallMessages()", del_wall_msg_code + "\n    async getWallMessages()")
    
    with open('src/data/mockDB.js', 'w') as f:
        f.write(content)
    print("Added deleteWallMessage to mockDB.js")
else:
    print("deleteWallMessage already exists")
