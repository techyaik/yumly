const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '_')
        .replace(/^-+|-+$/g, '');
}

const mismatches = [];

recipes.forEach(recipe => {
    const titleSlug = slugify(recipe.title);
    const imageBase = path.basename(recipe.images.thumbnail, '.png');
    
    // Check if the slug is contained in the image name or vice versa
    if (!imageBase.includes(titleSlug) && !titleSlug.includes(imageBase)) {
        // More lenient check: check if major words overlap
        const titleWords = titleSlug.split('_').filter(w => w.length > 3);
        const imageWords = imageBase.split('_').filter(w => w.length > 3);
        
        const overlap = titleWords.filter(w => imageWords.includes(w));
        
        if (overlap.length === 0) {
            mismatches.push({
                id: recipe.id,
                title: recipe.title,
                image: imageBase,
                slug: titleSlug
            });
        }
    }
});

console.log(JSON.stringify({
    mismatchCount: mismatches.length,
    mismatches: mismatches
}, null, 2));
