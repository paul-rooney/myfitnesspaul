export const debounce = (callback, wait) => {
    let timeoutId = null;

    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
};

export const groupBy = (arr, key) => arr.reduce((acc, item) => ((acc[item[key]] = [...(acc[item[key]] || []), item]), acc), {});

// const groupBy = (arr, key) => arr.reduce((acc, item) => {
//     // Get the value of the specified key from the current item
//     const keyValue = item[key];

//     // Check if the key already exists in the accumulator object
//     if (keyValue in acc) {
//       // If the key exists, append the current item to its corresponding array
//       acc[keyValue].push(item);
//     } else {
//       // If the key does not exist, create a new array with the current item and assign it to the key in the accumulator object
//       acc[keyValue] = [item];
//     }

//     // Return the updated accumulator object for the next iteration
//     return acc;
//   }, {});

export const stripNonAlphanumeric = (str) => str.replace(/[^a-zA-Z0-9\s]/g, ''); 

export const formatDate = (date, locale) => new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const calculateMacronutrientTotals = (recipes) => {
    return recipes.map((item) => ({
        ...item,
        total_kcal: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / item.servings),
        total_carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / item.servings),
        total_fat: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / item.servings),
        total_protein: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / item.servings),
    }));
};