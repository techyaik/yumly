const fs = require('fs');
const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));

const recipesWithoutImages = recipes.filter(r => !r.images || !r.images.thumbnail || !r.images.hero);

console.log(JSON.stringify({
    totalRecipes: recipes.length,
    withoutImagesCount: recipesWithoutImages.length,
    withoutImages: recipesWithoutImages.map(r => ({id: r.id, title: r.title}))
}, null, 2));
