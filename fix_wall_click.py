import sys

def run():
    with open('src/components/GlobalWall.jsx', 'r') as f:
        content = f.read()

    # Change the submit function to alert if empty, and strip undefined
    new_submit = """    const submitMessage = async () => {
        if (!newMsg.trim()) {
            alert("Please write something before pinning to the wall!");
            return;
        }
        setSending(true);
        try {
            const finalAuthorName = authorName.trim() || currentUser?.name || 'Anonymous';
            const finalAuthorId = currentUser?.id || null;
            
            await mockDB.addWallMessage({
                text: newMsg.trim(),
                author: isAnonymous ? 'Anonymous' : finalAuthorName,
                author_id: isAnonymous ? null : finalAuthorId
            });
            setNewMsg('');
            setIsWriting(false);
            await loadMessages();
        } catch (e) {
            console.error(e);
            alert("Something went wrong, please try again.");
        } finally {
            setSending(false);
        }
    };"""

    # We replace from "const submitMessage = async () => {" to "    };"
    import re
    content = re.sub(r'const submitMessage = async \(\) => \{.+?    \};', new_submit, content, flags=re.DOTALL)
    
    # Remove the disabled property from the button
    content = content.replace("disabled={sending || !newMsg.trim()}", "disabled={sending}")
    content = content.replace("opacity: newMsg.trim() ? 1 : 0.5,", "opacity: sending ? 0.7 : 1,")
    content = content.replace("cursor: newMsg.trim() ? 'pointer' : 'not-allowed',", "cursor: sending ? 'wait' : 'pointer',")
    
    with open('src/components/GlobalWall.jsx', 'w') as f:
        f.write(content)

run()
