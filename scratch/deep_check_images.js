const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));
const referencedImages = new Set();

recipes.forEach(recipe => {
    if (recipe.images) {
        Object.values(recipe.images).forEach(imagePath => {
            referencedImages.add(path.basename(imagePath));
        });
    }
});

const existingImages = new Set(fs.readdirSync('assets/images/recipes'));

const missing = [];
referencedImages.forEach(img => {
    if (!existingImages.has(img)) {
        missing.push(img);
    }
});

console.log("Total unique referenced images:", referencedImages.size);
console.log("Total existing images:", existingImages.size);
console.log("Missing images:", missing);

if (missing.length === 0) {
    console.log("All referenced images exist. Let's see if some recipes use 'placeholder' images.");
    const recipesWithPlaceholders = recipes.filter(r => 
        r.images.thumbnail.includes('placeholder') || 
        r.images.thumbnail.includes('default')
    );
    console.log("Recipes with 'placeholder' or 'default' in image name:", recipesWithPlaceholders.length);
}
