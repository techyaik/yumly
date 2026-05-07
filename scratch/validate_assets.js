const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));
const assetsDir = 'assets/images/recipes';
const existingFiles = new Set(fs.readdirSync(assetsDir));

const missing = [];

recipes.forEach(recipe => {
    const fileName = path.basename(recipe.images.thumbnail);
    if (!existingFiles.has(fileName)) {
        missing.push({
            id: recipe.id,
            title: recipe.title,
            file: fileName
        });
    }
});

if (missing.length > 0) {
    console.log("CRITICAL: Some referenced images do not exist in assets folder!");
    console.log(JSON.stringify(missing, null, 2));
    process.exit(1);
} else {
    console.log("All referenced images exist in assets folder.");
}
