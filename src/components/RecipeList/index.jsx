import { useEffect, useMemo, useState } from "react";
import { Box, Cluster, Icon, Stack } from "../../primitives";
import { getRows, insertRow, updateRow, deleteRow, supabase } from "../../supabase";
import styles from "./recipe-list.module.scss";
import { debounce, groupBy, stripNonAlphanumeric } from "../../utilities";
import Nutribot from "../Nutribot";
import CreateRecipeDialog from "./CreateRecipeDialog";
import CreateRecipesIngredientsDialog from "./CreateRecipesIngredientsDialog";
import FilterRecipesWidget from "./FilterRecipesWidget";

const getRecipes = async () => {
    const { data, error } = await supabase.from("recipes").select(`
        id,
        display_name,
        servings,
        recipes_ingredients (
            ingredients!recipes_ingredients_ingredient_id_fkey (
                display_name
            ),
            ingredient_identifier,
            quantity,
            unit,
            recipes_macronutrients (
                kcal,
                carbohydrate,
                fat,
                protein
            )
        )
    `);

    return data ?? error;
};

const RecipeList = () => {
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState({});
    const [mealPlan, setMealPlan] = useState([]);

    useEffect(() => {
        if (ingredients.length > 0) return;

        if (localStorage.getItem("ingredients")) {
            setIngredients(JSON.parse(localStorage.getItem("ingredients")));
            return;
        }

        getRows("ingredients").then((data) => {
            localStorage.setItem("ingredients", JSON.stringify(data));
            setIngredients(data);
        });
    }, []);

    useEffect(() => {
        if (recipes.length > 0) return;

        if (localStorage.getItem("recipes")) {
            const storedRecipes = JSON.parse(localStorage.getItem("recipes"));
            setRecipes(storedRecipes);
            setFilteredRecipes(storedRecipes); // Add this line to initialize filteredRecipes
            return;
        }

        getRecipes().then((data) => {
            const dataWithMacronutrientTotals = data.map((item) => ({
                ...item,
                total_kcal: item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / item.servings,
                total_carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / item.servings),
                total_fat: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / item.servings),
                total_protein: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / item.servings),
            }));

            localStorage.setItem("recipes", JSON.stringify(dataWithMacronutrientTotals));
            setRecipes(dataWithMacronutrientTotals);
            setFilteredRecipes(dataWithMacronutrientTotals);
        });
    }, []);

    useEffect(() => {
        listen();
    }, []);

    const listen = () => {
        supabase
            .channel("any")
            .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
                console.log("Payload received: ", payload);
                getRecipes().then((data) => {
                    const dataWithMacronutrientTotals = data.map((item) => ({
                        ...item,
                        total_kcal: item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / item.servings,
                        total_carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / item.servings),
                        total_fat: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / item.servings),
                        total_protein: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / item.servings),
                    }));

                    localStorage.setItem("recipes", JSON.stringify(dataWithMacronutrientTotals));
                    setRecipes(dataWithMacronutrientTotals);
                    setFilteredRecipes(dataWithMacronutrientTotals);
                });
            })
            .subscribe();
    };

    const clickHandler = (event) => {
        const { id, operation } = event.target.closest("button").dataset;
        const [item] = recipes.filter((item) => item.id === id);
        let dialog;

        switch (operation) {
            case "create":
                dialog = document.getElementById("createRecipeDialog");
                dialog.showModal();
                break;

            case "update":
                setIngredientToUpdate(item);
                dialog = document.getElementById("updateIngredientDialog");
                dialog.showModal();
                break;

            case "delete":
                setIngredientToDelete(item);
                dialog = document.getElementById("deleteIngredientDialog");
                dialog.showModal();
                break;

            default:
                break;
        }
    };

    const submitHandler = (event) => {
        const form = event.target;
        const { operation } = form.dataset;
        const { display_name, servings } = form;
        let dialog;
        let recipe = [
            {
                identifier: stripNonAlphanumeric(display_name.value).trim().toLowerCase(),
                display_name: display_name.value.trim(),
                servings: servings.value,
            },
        ];

        switch (operation) {
            case "create":
                insertRow("recipes", recipe).then((res) => {
                    setNewRecipe(res[0]);
                    dialog = document.getElementById("createRecipesIngredientsDialog");
                    dialog.showModal();
                    console.log(res[0]);

                    // getRecipes().then((data) => {
                    //     const groupedData = Object.values(groupBy(data, "id"));

                    //     localStorage.setItem("recipes", JSON.stringify(groupedData));
                    //     setRecipes(groupedData);
                    // });
                });
                break;

            default:
                break;
        }

        form.reset();
    };

    // function getRandomCombination(objects, range) {
    //     const numbers = objects.map((obj) => obj.kcal);
    //     const combinations = [];
    //     const stack = [{ arr: [], sum: 0, index: 0 }];

    //     while (stack.length > 0) {
    //         const { arr, sum, index } = stack.pop();

    //         if (sum >= range[0] && sum <= range[1]) {
    //             combinations.push(arr);
    //         }

    //         if (sum > range[1] || index >= numbers.length) {
    //             continue;
    //         }

    //         stack.push({ arr: [...arr, objects[index]], sum: sum + numbers[index], index: index + 1 });
    //         stack.push({ arr, sum, index: index + 1 });
    //     }

    //     if (combinations.length === 0) {
    //         return null; // No valid combinations found
    //     }

    //     const randomIndex = Math.floor(Math.random() * combinations.length);
    //     return combinations[randomIndex];
    // }

    // function getRandomCombination(objects, range1, range2) {
    //     const combinations = [];
    //     const stack = [{ arr: [], kcalSum: 0, proteinSum: 0, index: 0 }];

    //     while (stack.length > 0) {
    //         const { arr, kcalSum, proteinSum, index } = stack.pop();
    //         const currentObject = objects[index];

    //         const newKcalSum = kcalSum + currentObject.kcal;
    //         const newProteinSum = proteinSum + currentObject.protein;

    //         if (newKcalSum >= range1[0] && newKcalSum <= range1[1] && newProteinSum >= range2[0] && newProteinSum <= range2[1]) {
    //             combinations.push([...arr, currentObject]);
    //         }

    //         if (newKcalSum > range1[1] || newProteinSum > range2[1] || index >= objects.length - 1) {
    //             continue;
    //         }

    //         stack.push({ arr: [...arr, currentObject], kcalSum: newKcalSum, proteinSum: newProteinSum, index: index + 1 });
    //         stack.push({ arr, kcalSum, proteinSum, index: index + 1 });
    //     }

    //     if (combinations.length === 0) {
    //         return null; // No valid combinations found
    //     }

    //     const randomIndex = Math.floor(Math.random() * combinations.length);
    //     return combinations[randomIndex];
    // }

    function getRandomCombinations(objects, range1, range2, n) {
        // Shuffle the objects array
        const shuffledObjects = shuffleArray(objects);

        const combinations = [];
        const uniqueCombinations = new Set();
        const stack = [{ arr: [], kcalSum: 0, proteinSum: 0, index: 0 }];

        while (stack.length > 0 && uniqueCombinations.size < n) {
            const { arr, kcalSum, proteinSum, index } = stack.pop();
            const currentObject = shuffledObjects[index];

            const newKcalSum = kcalSum + currentObject.kcal;
            const newProteinSum = proteinSum + currentObject.protein;

            if (newKcalSum >= range1[0] && newKcalSum <= range1[1] && newProteinSum >= range2[0] && newProteinSum <= range2[1]) {
                const combination = [...arr, currentObject];
                const combinationString = JSON.stringify(combination);

                if (!uniqueCombinations.has(combinationString)) {
                    uniqueCombinations.add(combinationString);
                    combinations.push(combination);
                }
            }

            if (newKcalSum > range1[1] || newProteinSum > range2[1] || index >= shuffledObjects.length - 1) {
                continue;
            }

            stack.push({
                arr: [...arr, currentObject],
                kcalSum: newKcalSum,
                proteinSum: newProteinSum,
                index: index + 1,
            });
            stack.push({ arr, kcalSum, proteinSum, index: index + 1 });
        }

        return combinations.slice(0, n);
    }

    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const generateMealPlan = async () => {
        const numbers = recipes.map((recipe) => ({
            id: recipe.id,
            display_name: recipe.display_name,
            kcal: recipe.total_kcal,
            protein: recipe.total_protein,
        }));

        const range1 = [1400, 1600];
        const range2 = [120, 160];
        const combination = getRandomCombinations(numbers, range1, range2, 5);

        console.log(combination);

        if (combination) {
            const ids = combination.map((item) => item.map((obj) => obj.id)); // Extracting the IDs from the combination array
            // const { data, error } = await supabase.from("recipes").select().in("id", ids);

            // if (error) {
            //     console.log("Error retrieving recipes:", error);
            // } else {
            //     console.log(data);
            // }

            setMealPlan(combination);
        } else {
            console.log("Nothing returned");
        }
    };

    return (
        <>
            <h2 className={styles.heading}>Recipes</h2>
            <button className={styles.addButton} data-operation="create" onClick={generateMealPlan}>
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Generate meal plan
                </Icon>
            </button>
            {mealPlan.length > 0
                ? mealPlan.map((day, index) => (
                      <div style={{ fontSize: "var(--font-size-0)" }}>
                          <Stack key={index} space="var(--size-2)">
                              <h3>Day {index + 1}</h3>
                              {day.map((meal) => (
                                  <Stack key={`${meal.id}-${index}`} space="var(--size-1)">
                                      <span style={{ color: "var(--jungle-10)", fontWeight: "600" }}>{meal.display_name}</span>
                                      <Cluster>
                                          <span>kcal: {meal.kcal}</span>

                                          <span>Protein: {meal.protein}</span>
                                      </Cluster>
                                  </Stack>
                              ))}
                              <Cluster>
                                  <Stack>
                                      <span>Total kcal:</span>
                                      {day.reduce((acc, meal) => meal.kcal + acc, 0)}
                                  </Stack>
                                  <Stack>
                                      <span>Total protein:</span>
                                      {day.reduce((acc, meal) => meal.protein + acc, 0)}
                                  </Stack>
                              </Cluster>
                          </Stack>
                      </div>
                  ))
                : null}
            <button className={styles.addButton} data-operation="create" onClick={clickHandler}>
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Add recipe
                </Icon>
            </button>
            {/* <FilterRecipesWidget recipes={recipes} /> */}
            <ul className={styles.ul}>
                {filteredRecipes.length > 0 ? (
                    filteredRecipes
                        .sort((a, b) =>
                            new Intl.Collator(undefined, {
                                sensitivity: "base",
                                ignorePunctuation: true,
                            }).compare(a.display_name, b.display_name)
                        )
                        .map(({ id, display_name, servings, total_kcal, total_carbohydrate, total_fat, total_protein, recipes_ingredients: ingredients }) => (
                            <li className={styles.li} key={id}>
                                <details className={styles.details}>
                                    <summary className={styles.summary}>
                                        <header className={styles.header}>
                                            <Stack space="0">
                                                <span className={styles.servings}>Serves {servings}</span>
                                                <span className={styles.displayName}>{display_name}</span>
                                            </Stack>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "nowrap",
                                                    gap: "var(--size-1)",
                                                }}
                                            >
                                                <button className={styles.editButton} onClick={() => clickHandler(name)}>
                                                    <Icon icon="edit-3" />
                                                </button>
                                                <button className={styles.deleteButton} onClick={() => clickHandler(name)}>
                                                    <Icon icon="trash-2" />
                                                </button>
                                            </div>
                                        </header>
                                        <Cluster space="var(--size-2)">
                                            <Stack>
                                                <span className={styles.label}>kcal</span>
                                                {total_kcal}
                                            </Stack>
                                            <Stack>
                                                <span className={styles.label}>Carbohydrate</span>
                                                {total_carbohydrate}
                                            </Stack>
                                            <Stack>
                                                <span className={styles.label}>Fat</span>
                                                {total_fat}
                                            </Stack>
                                            <Stack>
                                                <span className={styles.label}>Protein</span>
                                                {total_protein}
                                            </Stack>
                                        </Cluster>
                                    </summary>
                                    {ingredients && (
                                        <Stack>
                                            <Cluster space="var(--size-1)">
                                                {ingredients.map(({ ingredient_identifier, ingredients, recipes_macronutrients: macronutrients }) => {
                                                    const primaryMacronutrient = Math.max(macronutrients.carbohydrate, macronutrients.fat, macronutrients.protein);

                                                    return (
                                                        <p
                                                            key={ingredient_identifier}
                                                            className={macronutrients.carbohydrate === primaryMacronutrient ? styles.highlightCarbohydrate : macronutrients.fat === primaryMacronutrient ? styles.highlightFat : styles.highlightProtein}
                                                            style={{ backgroundColor: "var(--gray-6)", borderRadius: "var(--radius-2)", color: "var(--gray-0)", fontSize: "var(--font-size-0)", marginBlock: "0", padding: "var(--size-1) var(--size-2)" }}
                                                        >
                                                            {ingredients.display_name}
                                                        </p>
                                                    );
                                                })}
                                            </Cluster>
                                            <ul style={{ listStyleType: "none", paddingInlineStart: "0" }}>
                                                {ingredients.map(({ ingredients, quantity, unit }, index) => (
                                                    <li key={index} style={{ fontSize: "var(--font-size-0)", paddingInlineStart: "0" }}>
                                                        <Cluster justify="space-between" space="var(--size-3)">
                                                            <span>{ingredients.display_name}</span>{" "}
                                                            <span>
                                                                {quantity} {unit}
                                                            </span>
                                                        </Cluster>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Stack>
                                    )}
                                </details>
                            </li>
                        ))
                ) : (
                    <li>No recipes found</li>
                )}
            </ul>
            <CreateRecipeDialog handleSubmit={submitHandler} />
            <CreateRecipesIngredientsDialog ingredients={ingredients} recipe={newRecipe} />
            {/* <Nutribot /> */}
        </>
    );
};

export default RecipeList;
