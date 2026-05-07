const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));
const imageFrequency = {};

recipes.forEach(recipe => {
    if (recipe.images) {
        const thumb = path.basename(recipe.images.thumbnail);
        imageFrequency[thumb] = (imageFrequency[thumb] || 0) + 1;
    }
});

const sorted = Object.entries(imageFrequency).sort((a, b) => b[1] - a[1]);
console.log("Top 10 most used images:");
console.log(JSON.stringify(sorted.slice(0, 10), null, 2));

const singleUse = sorted.filter(x => x[1] === 1).length;
console.log("Images used only once:", singleUse);
console.log("Total unique images used:", sorted.length);
