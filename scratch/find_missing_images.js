const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));
const existingImages = new Set(fs.readdirSync('assets/images/recipes'));

const missingImages = new Set();
const recipeImageMap = {};

recipes.forEach(recipe => {
    if (recipe.images) {
        Object.values(recipe.images).forEach(imagePath => {
            const fileName = path.basename(imagePath);
            if (!existingImages.has(fileName)) {
                missingImages.add(fileName);
                if (!recipeImageMap[fileName]) {
                    recipeImageMap[fileName] = {
                        title: recipe.title,
                        summary: recipe.summary
                    };
                }
            }
        });
    }
});

console.log(JSON.stringify({
    missingCount: missingImages.size,
    missingImages: Array.from(missingImages),
    recipeImageMap: recipeImageMap
}, null, 2));
