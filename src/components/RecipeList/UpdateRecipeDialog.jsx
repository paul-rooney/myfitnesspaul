import { Fragment, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";
import { deleteRows, insertRows } from "../../supabase";

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
        let dialog;

        switch (operation) {
            case "add":
                break;

            case "update":
                console.log("Updating");
                break;

            case "delete":
                if (confirm(`Are you sure you want to delete ${identifier}?`)) {
                    console.log("Deleting...", identifier);
                    deleteRows("recipes_ingredients", id);
                } else {
                    console.log(`${identifier} was not deleted.`);
                }
                break;

            default:
                break;
        }
    };

    const submitHandler = () => {
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
                {/* {recipe.ingredients.map(item => <span key={item}>{item}</span>)} */}
                <Stack space="var(--size-2)">
                    {recipe &&
                        recipe.recipes_ingredients &&
                        recipe.recipes_ingredients.map((item, index) => (
                            <Fragment key={index}>
                                <Cluster space="var(--size-2)">
                                    <span style={{ marginInlineEnd: "auto" }}>{item.ingredient_identifier}</span>
                                    <button
                                        type="button"
                                        data-id={item.id}
                                        data-identifier={item.ingredient_identifier}
                                        data-operation="update"
                                        onClick={clickHandler}
                                    >
                                        <Icon label="Update" icon="edit" />
                                    </button>
                                    <button
                                        type="button"
                                        data-id={item.id}
                                        data-identifier={item.ingredient_identifier}
                                        data-operation="delete"
                                        onClick={clickHandler}
                                    >
                                        <Icon label="Remove" icon="trash" />
                                    </button>
                                </Cluster>
                            </Fragment>
                        ))}
                </Stack>
                <details>
                    <summary>Add ingredient</summary>
                    <Stack>
                        <div className={styles.addIngredientFieldset}>
                            <Stack>
                                <input id="recipe_id" hidden readOnly value={recipe?.id} />
                                <Stack space="var(--size-1)">
                                    <label className={styles.label} htmlFor="ingredient_id">
                                        ingredient_id
                                    </label>
                                    <input id="ingredient_id" disabled required value={ingredientID ?? ""} />
                                </Stack>
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
                                    <input
                                        placeholder="Leave blank to use the typical unit weight"
                                        id="unit"
                                        list="units"
                                    />
                                    <datalist id="units">
                                        <option>g</option>
                                        <option>ml</option>
                                        <option>tbsp</option>
                                        <option>tsp</option>
                                    </datalist>
                                </Stack>
                                <button type="button" onClick={addIngredientToList}>
                                    Add
                                </button>
                            </Stack>
                        </div>
                    </Stack>
                </details>
            </Stack>
        </Dialog>
    );
};

export default UpdateRecipeDialog;
