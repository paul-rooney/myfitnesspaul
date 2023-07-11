import { Fragment, useState } from "react";
import { deleteRows, insertRows } from "../../supabase";
import { Cluster, Icon, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";

const UpdateRecipeDialog = ({ recipe, ingredients }) => {
    const [recipeIngredients, setRecipeIngredients] = useState([]);
    const [ingredientID, setIngredientID] = useState(null);

    const blurHandler = (event) => {
        const { value } = event.target;
        const [item] = ingredients.filter((item) => item.identifier === value);

        if (!item) return;

        const { id } = item;

        setIngredientID(id);
    };

    const addIngredientToList = (event) => {
        const form = event.target.closest("form");
        const { recipe_id, ingredient_id, ingredient_identifier, quantity, unit } = form;

        if (!recipe_id.value || !ingredient_id.value || !ingredient_identifier.value || !quantity.value) return;

        let ingredient = {
            recipe_id: recipe_id.value,
            ingredient_id: ingredient_id.value,
            ingredient_identifier: ingredient_identifier.value,
            quantity: parseFloat(quantity.value),
            unit: unit.value ? unit.value : null,
        };

        setRecipeIngredients((previous) => [ingredient, ...previous]);
        form.reset();
    };

    const clickHandler = (event) => {
        event.preventDefault();

        const { id, identifier, operation } = event.target.closest("button").dataset;

        switch (operation) {
            case "add":
                break;

            case "update":
                break;

            case "delete":
                if (confirm(`Delete ${identifier}?`)) {
                    deleteRows("recipes_ingredients", id);
                }
                break;

            default:
                break;
        }
    };

    const submitHandler = () => {
        // this handler being called within this component is preventing the handler running for changes to display name and servings
        insertRows("recipes_ingredients", recipeIngredients)
            .catch((error) => console.error(error))
            .finally(() => {
                setRecipeIngredients([]);
            });
    };

    return (
        <Dialog id="updateRecipeDialog" title="Update recipe" submitHandler={submitHandler}>
            <Stack>
                <input id="id" hidden defaultValue={recipe.id} />
                <input id="source" hidden defaultValue={recipe.source} />
                <Stack space="var(--size-1)">
                    <label className={styles.label} htmlFor="display_name">
                        Display name
                    </label>
                    <input name="display_name" id="display_name" required defaultValue={recipe.display_name} />
                </Stack>
                <Stack space="var(--size-1)">
                    <label className={styles.label} htmlFor="servings">
                        Number of servings
                    </label>
                    <input id="servings" type="number" required defaultValue={recipe.servings} />
                </Stack>
                <Stack space="var(--size-2)">
                    {recipe &&
                        recipe.recipes_ingredients &&
                        recipe.recipes_ingredients.map((item, index) => (
                            <Fragment key={index}>
                                <Cluster space="var(--size-2)">
                                    <span style={{ marginInlineEnd: "auto" }}>{item.ingredient_identifier}</span>
                                    <button type="button" data-id={item.id} data-identifier={item.ingredient_identifier} data-operation="update" onClick={clickHandler}>
                                        <Icon label="Update" icon="edit" />
                                    </button>
                                    <button type="button" data-id={item.id} data-identifier={item.ingredient_identifier} data-operation="delete" onClick={clickHandler}>
                                        <Icon label="Remove" icon="trash" />
                                    </button>
                                </Cluster>
                            </Fragment>
                        ))}
                </Stack>
                <hr />
                <details>
                    <summary>Add ingredient</summary>
                    <div className={styles.addIngredientFieldset}>
                        <Stack>
                            <input id="recipe_id" hidden readOnly defaultValue={recipe?.id} />
                            <input id="ingredient_id" hidden defaultValue={ingredientID ?? ""} />
                            <Stack space="var(--size-1)">
                                <label>Identifier</label>
                                <input id="ingredient_identifier" list="ingredients_list" onBlur={blurHandler} />
                                <datalist id="ingredients_list">
                                    {ingredients.map((item) => (
                                        <option key={item.id}>{item.identifier}</option>
                                    ))}
                                </datalist>
                            </Stack>
                            <Stack space="var(--size-1)">
                                <label className={styles.label} htmlFor="quantity">
                                    Quantity
                                </label>
                                <input id="quantity" type="number" />
                            </Stack>
                            <Stack space="var(--size-1)">
                                <label className={styles.label} htmlFor="unit">
                                    Unit <small>(optional)</small>
                                </label>
                                <input placeholder="Leave blank to use the typical unit weight" id="unit" list="units" />
                                <datalist id="units">
                                    <option>g</option>
                                    <option>ml</option>
                                    <option>tbsp</option>
                                    <option>tsp</option>
                                </datalist>
                            </Stack>
                            <button className={styles.addIngredientButton} type="button" onClick={addIngredientToList}>
                                Add
                            </button>
                        </Stack>
                    </div>
                </details>
            </Stack>
        </Dialog>
    );
};

export default UpdateRecipeDialog;
