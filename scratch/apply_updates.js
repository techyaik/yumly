const fs = require('fs');
const path = require('path');

const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));

const updates = {
  "v_42": "mushroom_do_pyaza.png", // Newly generated
  "v_50": "chicken_biryani.png", // Better than rajma_chawal
  "br_30": "pancakes.png",
  "ds_4": "lava_cake.png",
  "mx_2": "chicken_tacos.png",
  "ch_2": "kung_pao_chicken.png",
  "nv_16": "chicken_biryani.png",
  "nv_11": "aloo_mutter.png", // Keema mutter better with aloo mutter than chicken curry
  "nv_27": "mutton_rogan_josh.png",
  "nv_34": "mutton_rogan_josh.png",
  "nv_38": "mutton_rogan_josh.png",
  "nv_46": "mutton_rogan_josh.png",
  "nv_48": "mutton_rogan_josh.png",
  "it_8": "margherita_pizza.png"
};

recipes.forEach(recipe => {
    if (updates[recipe.id]) {
        const newImg = `../assets/images/recipes/${updates[recipe.id]}`;
        recipe.images.thumbnail = newImg;
        recipe.images.hero = newImg;
    }
});

fs.writeFileSync('src/data/recipes.json', JSON.stringify(recipes, null, 3));
console.log("Updated 14 recipes with better/new images.");
