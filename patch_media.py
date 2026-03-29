with open("src/components/MediaVault.jsx", "r") as f:
    text = f.read()

# Replace const CATEGORIES with dynamic categories
text = text.replace("const CATEGORIES = ['All Memories', '1st yr', '2nd yr', '3rd yr', '4th yr', 'Fiesta\\'25'];", "")

# Add dynamic logic
logic_old = """    const [newestFirst, setNewestFirst] = useState(true);

    useEffect(() => {
        mockDB.getVaultPhotos().then(dbPhotos => {
            setPhotos(dbPhotos);
        }).catch(err => console.error(err));
    }, []);"""

logic_new = """    const [newestFirst, setNewestFirst] = useState(true);
    const [categories, setCategories] = useState(['1st yr', '2nd yr', '3rd yr', '4th yr', 'Fiesta\\'25']);

    useEffect(() => {
        mockDB.getVaultPhotos().then(dbPhotos => {
            setPhotos(dbPhotos);
        }).catch(err => console.error(err));
        
        mockDB.getSettings().then(settings => {
             if (settings && settings.vault_categories) {
                 setCategories(settings.vault_categories);
             }
        }).catch(err => console.error(err));
    }, []);"""

text = text.replace(logic_old, logic_new)

# Replace {CATEGORIES.map(cat => ( with {['All Memories', ...categories].map(cat => (
text = text.replace("{CATEGORIES.map(cat => (", "{['All Memories', ...categories].map(cat => (")

with open("src/components/MediaVault.jsx", "w") as f:
    f.write(text)

