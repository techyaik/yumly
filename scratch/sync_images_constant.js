const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));

let content = 'export const RecipeImages: { [key: string]: any } = {\n';

recipes.forEach(recipe => {
    // The path in JSON is relative to the data folder: ../assets/images/recipes/name.png
    // In the TS file, it should be relative to the constants folder: ../../assets/images/recipes/name.png
    const jsonPath = recipe.images.thumbnail;
    const tsPath = jsonPath.replace('../assets', '../../assets');
    content += `  "${recipe.id}": require("${tsPath}"),\n`;
});

content += '};\n';

fs.writeFileSync('src/constants/recipe-images.ts', content);
console.log("Updated src/constants/recipe-images.ts with all recipe image paths.");
