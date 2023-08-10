import { useEffect, useState } from "react";
import { Icon, Stack } from "../../primitives";
import { deleteRows, insertRows, readRows, updateRows } from "../../supabase";
import RecipeCard from "./RecipeCard";
import CreateRecipeDialog from "./CreateRecipeDialog";
import CreateRecipesIngredientsDialog from "./CreateRecipesIngredientsDialog";
import { sortAlphabetical, stripNonAlphanumeric } from "../../utilities";
import FilterRecipesForm from "./FilterRecipesWidget";
import UpdateRecipeDialog from "./UpdateRecipeDialog";
import DeleteRecipeDialog from "./DeleteRecipeDialog";
import useSessionStorage from "../../hooks/useSessionStorage";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import Paginator from "../Common/Paginator";
import EmptyState from "../Common/EmptyState";

const RecipeList = ({ ingredients, recipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState({});
    const [recipeToUpdate, setRecipeToUpdate] = useState({});
    const [recipeToDelete, setRecipeToDelete] = useState({});
    const [sources, setSources] = useSessionStorage("recipes_sources", []);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);

    useEffect(() => {
        const recipes_sources = sessionStorage.getItem("recipes_sources");

        if (recipes_sources && JSON.parse(recipes_sources).length) return;

        readRows("recipes_sources").then((data) => setSources(data));
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
        const { id, display_name, servings, source, page_number } = form;
        let dialog;
        let recipe = [
            {
                identifier: stripNonAlphanumeric(display_name.value).trim().toLowerCase(),
                display_name: display_name.value.trim(),
                servings: servings.value,
                source: source.value !== "" ? source.value : null,
                page_number: page_number.value !== "" ? page_number.value :  null,
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
            <PrimaryHeading>Recipes</PrimaryHeading>

            <FilterRecipesForm recipes={recipes} setFilteredRecipes={setFilteredRecipes} />

            <Button variant="primary" fullWidth data-operation="create" clickHandler={clickHandler}>
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Add recipe
                </Icon>
            </Button>

            <Paginator arrayToPaginate={filteredRecipes} itemsPerPage={10} setStartIndex={setStartIndex} setEndIndex={setEndIndex} />

            <Stack space="var(--size-1)" role="list">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes
                        .sort((a, b) => sortAlphabetical(a, b, "display_name"))
                        .slice(startIndex, endIndex)
                        .map((recipe, index) => (
                                <RecipeCard recipe={recipe} handleClick={clickHandler} role="listitem" key={`${recipe.id}-${index}`} />
                        ))
                ) : (
                    <EmptyState>No recipes to display</EmptyState>
                )}
            </Stack>

            <CreateRecipeDialog sources={sources} handleSubmit={submitHandler} />
            <CreateRecipesIngredientsDialog ingredients={ingredients} recipe={newRecipe} />
            <UpdateRecipeDialog recipe={recipeToUpdate} ingredients={ingredients} />
            <DeleteRecipeDialog recipe={recipeToDelete} handleSubmit={submitHandler} />
        </Stack>
    );
};

export default RecipeList;
