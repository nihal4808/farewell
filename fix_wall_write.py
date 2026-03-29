import sys

def run():
    with open('src/data/mockDB.js', 'r') as f:
        content = f.read()

    old_write = """        if (USE_FIREBASE) {
            try {
                const docRef = await addDoc(collection(db, WALL_COL), msg);
                msg.id = docRef.id;
            } catch (e) {
                console.error('Add wall message failed', e);
                msg.id = 'w_' + Date.now();
            }
        }"""
        
    new_write = """        if (USE_FIREBASE) {
            try {
                const docRef = await withWriteTimeout(addDoc(collection(db, WALL_COL), msg));
                msg.id = docRef.id;
            } catch (e) {
                console.warn('Add wall message failed, falling back offline', e);
                msg.id = 'w_' + Date.now();
            }
        }"""
        
    if old_write in content:
        content = content.replace(old_write, new_write)
        with open('src/data/mockDB.js', 'w') as f:
            f.write(content)
        print("Updated mockDB write logic")

run()
