import { useEffect, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import { insertRows, supabase } from "../../supabase";
import RecipeCard from "./RecipeCard";
import CreateRecipeDialog from "./CreateRecipeDialog";
import CreateRecipesIngredientsDialog from "./CreateRecipesIngredientsDialog";
import styles from "./recipe-list.module.scss";
import { stripNonAlphanumeric } from "../../utilities";
import usePagination from "../../hooks/usePagination";
// import Nutribot from "../Nutribot";
// import FilterRecipesWidget from "./FilterRecipesWidget";

const RecipeList = ({ ingredients, recipes, setRecipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState({});

    const itemsPerPage = 10;
    const totalPages = Math.ceil(recipes.length / itemsPerPage);
    const { currentPage, goToPage, nextPage, previousPage } = usePagination(totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedItems = recipes.slice(startIndex, endIndex);

    useEffect(() => {
        if (!recipes) return;

        setFilteredRecipes(recipes);
    }, [recipes]);

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
                        total_kcal: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / item.servings),
                        total_carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / item.servings),
                        total_fat: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / item.servings),
                        total_protein: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / item.servings),
                    }));

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
                insertRows("recipes", recipe).then((res) => {
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
            
            <button className={styles.addButton} data-operation="create" onClick={clickHandler}>
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Add recipe
                </Icon>
            </button>

            <Cluster justify="center" align="baseline" space="var(--size-1)">
                <button disabled={currentPage === 1} onClick={() => goToPage(1)}>
                    First
                </button>
                <button disabled={currentPage === 1} onClick={previousPage}>
                    Previous
                </button>
                <span style={{ fontSize: "var(--font-size-0)", minInlineSize: "3em", textAlign: "center" }}>{currentPage}</span>
                <button disabled={currentPage === totalPages} onClick={nextPage}>
                    Next
                </button>
                <button disabled={currentPage === totalPages} onClick={() => goToPage(totalPages)}>
                    Last
                </button>
            </Cluster>

            {/* <FilterRecipesWidget recipes={recipes} /> */}
            <ul className={styles.ul}>
                {displayedItems.length > 0 ? (
                    displayedItems
                        .sort((a, b) =>
                            new Intl.Collator(undefined, {
                                sensitivity: "base",
                                ignorePunctuation: true,
                            }).compare(a.display_name, b.display_name)
                        )
                        .map((recipe) => (
                            <li className={styles.li} key={recipe.id}>
                                <RecipeCard recipe={recipe} />
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
