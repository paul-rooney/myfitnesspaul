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

export const sortAlphabetical = (a, b, key) => {
    return new Intl.Collator(undefined, {
        sensitivity: "base",
        ignorePunctuation: true,
    }).compare(a[key], b[key]);
};

export const stripNonAlphanumeric = (str) => str.replace(/[^a-zA-Z0-9\s]/g, "");

export const formatDate = (date, locale) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long" }).format(date);

export const formatDateISO = (date = Date.now()) => new Date(date).toISOString().slice(0, 10);

export const getPastDate = (startDate, daysInPast) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - daysInPast);
    return newDate;
};

export const getFutureDate = (startDate, daysInFuture) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + daysInFuture);
    return newDate;
};

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const calculateMacronutrientTotals = (recipes) => {
    return recipes.map((item) => ({
        ...item,
        total_kcal: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / item.servings),
        total_carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / item.servings),
        total_fat: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / item.servings),
        total_protein: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / item.servings),
    }));
};
