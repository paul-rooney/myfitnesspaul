import { useEffect, useMemo, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import { getRows, insertRow, updateRow, deleteRow, supabase } from "../../supabase";
import styles from "./recipe-list.module.scss";
import { debounce, groupBy, stripNonAlphanumeric } from "../../utilities";
import Nutribot from "../Nutribot";
import CreateRecipeDialog from "./CreateRecipeDialog";
import CreateRecipesIngredientsDialog from "./CreateRecipesIngredientsDialog";
import FilterRecipesWidget from "./FilterRecipesWidget";

// const getRecipes = async () => {
//     const { data, error } = await supabase.rpc("get_all_recipe_breakdowns");
//     return data ?? error;
// };

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
            console.log(data);
            localStorage.setItem("recipes", JSON.stringify(data));
            setRecipes(data);
            setFilteredRecipes(data); // Initialize filteredRecipes with fetched data
        });
    }, []);

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

    return (
        <>
            <h2 className={styles.heading}>Recipes</h2>
            <button
                className={styles.addButton}
                data-operation="create"
                onClick={clickHandler}
            >
                <Icon
                    space=".5ch"
                    direction="ltr"
                    icon="plus"
                >
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
                        .map(({ id, display_name, servings, recipes_ingredients: ingredients }) => (
                            <li
                                className={styles.li}
                                key={id}
                            >
                                <details className={styles.details}>
                                    <summary className={styles.summary}>
                                        <header className={styles.header}>
                                            <Stack space="0">
                                                <span className={styles.servings}>Serves {servings}</span>
                                                <span className={styles.displayName}>{display_name}</span>
                                            </Stack>
                                            <div
                                                style={{
                                                    alignSelf: "center",
                                                    display: "flex",
                                                    flexWrap: "nowrap",
                                                    gap: "var(--size-1)",
                                                }}
                                            >
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => clickHandler(name)}
                                                >
                                                    <Icon icon="edit-3" />
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => clickHandler(name)}
                                                >
                                                    <Icon icon="trash-2" />
                                                </button>
                                            </div>
                                        </header>
                                        <Cluster space="var(--size-2)">
                                            <Stack>
                                                <span className={styles.label}>kcal</span>
                                                {ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / servings}
                                            </Stack>
                                            <Stack>
                                                <span className={styles.label}>Carbohydrate</span>
                                                {Math.round(ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / servings)}
                                            </Stack>
                                            <Stack>
                                                <span className={styles.label}>Fat</span>
                                                {Math.round(ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / servings)}
                                            </Stack>
                                            <Stack>
                                                <span className={styles.label}>Protein</span>
                                                {Math.round(ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / servings)}
                                            </Stack>
                                        </Cluster>
                                    </summary>
                                    {ingredients && (
                                        <Stack>
                                            <Cluster space="var(--size-1)">
                                                {ingredients.map(({ ingredient_identifier: identifier, ingredients, recipes_macronutrients: macronutrients }) => {
                                                    const primaryMacronutrient = Math.max(macronutrients.carbohydrate, macronutrients.fat, macronutrients.protein);

                                                    return (
                                                        <p
                                                            key={identifier}
                                                            className={macronutrients.carbohydrate === primaryMacronutrient ? styles.highlightCarbohydrate : macronutrients.fat === primaryMacronutrient ? styles.highlightFat : styles.highlightProtein}
                                                            style={{ backgroundColor: "var(--gray-6)", borderRadius: "var(--radius-2)", color: "var(--gray-0)", fontSize: "var(--font-size-0)", marginBlock: "0", padding: "var(--size-1) var(--size-2)" }}
                                                        >
                                                            {ingredients.display_name}
                                                        </p>
                                                    );
                                                })}
                                            </Cluster>
                                            <ul style={{ listStyleType: "none", paddingInlineStart: "0" }}>
                                                {ingredients.map(({ ingredients, quantity, unit }) => (
                                                    <li style={{ fontSize: "var(--font-size-0)", paddingInlineStart: "0" }}>
                                                        <Cluster
                                                            justify="space-between"
                                                            space="var(--size-3)"
                                                        >
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
            <CreateRecipesIngredientsDialog
                ingredients={ingredients}
                recipe={newRecipe}
            />
            {/* <Nutribot /> */}
        </>
    );
};

export default RecipeList;
