const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));
const existingImages = fs.readdirSync('assets/images/recipes').map(f => path.basename(f, '.png'));

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '_')
        .replace(/^-+|-+$/g, '');
}

const updates = [];

recipes.forEach(recipe => {
    const titleSlug = slugify(recipe.title);
    const currentImg = path.basename(recipe.images.thumbnail, '.png');
    
    // If it's a mismatch
    if (!currentImg.includes(titleSlug) && !titleSlug.includes(currentImg)) {
        // Try to find a better existing image
        let bestMatch = null;
        let bestScore = 0;
        
        existingImages.forEach(img => {
            const imgWords = img.split('_');
            const titleWords = titleSlug.split('_');
            const intersection = imgWords.filter(w => w.length > 3 && titleWords.includes(w));
            
            if (intersection.length > bestScore) {
                bestScore = intersection.length;
                bestMatch = img;
            }
        });
        
        if (bestMatch && bestScore > 0) {
            updates.push({
                id: recipe.id,
                title: recipe.title,
                oldImage: currentImg,
                newImage: bestMatch
            });
        }
    }
});

console.log(JSON.stringify(updates, null, 2));
