import { useEffect, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import { deleteRows, insertRows, readRows, updateRows } from "../../supabase";
import RecipeCard from "./RecipeCard";
import CreateRecipeDialog from "./CreateRecipeDialog";
import CreateRecipesIngredientsDialog from "./CreateRecipesIngredientsDialog";
import styles from "./recipe-list.module.scss";
import { stripNonAlphanumeric } from "../../utilities";
import usePagination from "../../hooks/usePagination";
import FilterRecipesWidget from "./FilterRecipesWidget";
import UpdateRecipeDialog from "./UpdateRecipeDialog";
import DeleteRecipeDialog from "./Dialogs/DeleteRecipeDialog";
import useSessionStorage from "../../hooks/useSessionStorage";

const RecipeList = ({ ingredients, recipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState({});
    const [recipeToUpdate, setRecipeToUpdate] = useState({});
    const [recipeToDelete, setRecipeToDelete] = useState({});
    const [sources, setSources] = useSessionStorage("recipes_sources", []);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(recipes.length / itemsPerPage);
    const { currentPage, goToPage, nextPage, previousPage } = usePagination(totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedItems = filteredRecipes
        .sort((a, b) =>
            new Intl.Collator(undefined, {
                sensitivity: "base",
                ignorePunctuation: true,
            }).compare(a.display_name, b.display_name)
        )
        .slice(startIndex, endIndex);

    useEffect(() => {
        const recipes_sources = sessionStorage.getItem("recipes_sources");

        if (recipes_sources && JSON.parse(recipes_sources).length) return;
        
        readRows("recipes_sources").then((data) => setSources(data));
    }, []);

    useEffect(() => {
        if (!recipes) return;

        setFilteredRecipes(recipes);
    }, [recipes]);

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
                setRecipeToUpdate(item);
                dialog = document.getElementById("updateRecipeDialog");
                dialog.showModal();
                break;

            case "delete":
                setRecipeToDelete(item);
                dialog = document.getElementById("deleteRecipeDialog");
                dialog.showModal();
                break;

            default:
                break;
        }
    };

    const submitHandler = (event) => {
        const form = event.target;
        const { operation } = form.dataset;
        const { id, display_name, servings, source } = form;
        let dialog;
        let recipe = [
            {
                identifier: stripNonAlphanumeric(display_name.value).trim().toLowerCase(),
                display_name: display_name.value.trim(),
                servings: servings.value,
                source: source.value !== "" ? source.value : null,
            },
        ];

        switch (operation) {
            case "create":
                insertRows("recipes", recipe).then((res) => {
                    setNewRecipe(res[0]);
                    dialog = document.getElementById("createRecipesIngredientsDialog");
                    dialog.showModal();
                });
                break;

            case "update":
                recipe.id = id.value;
                updateRows("recipes", recipe);
                setRecipeToUpdate({});

                break;

            case "delete":
                deleteRows("recipes", id.value);
                setRecipeToDelete({});

                break;

            default:
                break;
        }

        form.reset();
    };

    return (
        <Stack>
            <h2 className={styles.heading}>Recipes</h2>

            {/* <FilterRecipesWidget setFilteredRecipes={setFilteredRecipes} /> */}

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

            <ul className={styles.ul}>
                {displayedItems.length > 0 ? (
                    displayedItems.map((recipe) => (
                        <li className={styles.li} key={recipe.id}>
                            <RecipeCard recipe={recipe} handleClick={clickHandler} />
                        </li>
                    ))
                ) : (
                    <li>No recipes found</li>
                )}
            </ul>

            <CreateRecipeDialog sources={sources} handleSubmit={submitHandler} />
            <CreateRecipesIngredientsDialog ingredients={ingredients} recipe={newRecipe} />
            <UpdateRecipeDialog recipe={recipeToUpdate} ingredients={ingredients} />
            <DeleteRecipeDialog recipe={recipeToDelete} handleSubmit={submitHandler} />
        </Stack>
    );
};

export default RecipeList;
