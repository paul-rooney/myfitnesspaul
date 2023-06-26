import { useState } from "react";
import { Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";
import { deleteRow, insertRow } from "../../supabase";

const CreateRecipesIngredientsDialog = ({ recipe, ingredients }) => {
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

    const submitHandler = () => {
        if (recipeIngredients.length < 1) return;

        insertRow("recipes_ingredients", recipeIngredients)
            .catch((error) => console.error(error))
            .finally(() => {
                setRecipeIngredients([]);
            });
    };

    const closeHandler = (event) => {
        const { returnValue } = event.target;
        
        if (returnValue === "close") {
            console.log(returnValue);
            console.log(`Removed recipe with id ${recipe.id}`);
            deleteRow("recipes", recipe.id)
        }
    };

    return (
        <Dialog
            id="createRecipesIngredientsDialog"
            title="Add ingredients"
            operation="create"
            submitHandler={submitHandler}
            closeHandler={closeHandler}
        >
            <Stack space="var(--size-0)">
                {recipeIngredients &&
                    recipeIngredients.map((item, index) => (
                        <p
                            style={{ fontSize: "var(--size-0)", marginBlock: "0" }}
                            key={index}
                        >
                            {item.ingredient_identifier}
                        </p>
                    ))}
            </Stack>
            <Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="recipe_id"
                    >
                        recipe_id
                    </label>
                    <input
                        id="recipe_id"
                        disabled
                        required
                        value={recipe?.id}
                    />
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="ingredient_id"
                    >
                        ingredient_id
                    </label>
                    <input
                        id="ingredient_id"
                        disabled
                        required
                        value={ingredientID ?? ""}
                    />
                </Stack>

                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="ingredient_identifier"
                    >
                        ingredient_identifier
                    </label>
                    <input
                        id="ingredient_identifier"
                        list="ingredients_list"
                        onBlur={blurHandler}
                    />
                    <datalist id="ingredients_list">
                        {ingredients.map((item) => (
                            <option key={item.id}>{item.identifier}</option>
                        ))}
                    </datalist>
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="quantity"
                    >
                        Quantity
                    </label>
                    <input
                        id="quantity"
                        type="number"
                    />
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="unit"
                    >
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
                <button
                    onClick={addIngredientToList}
                    type="button"
                >
                    Add
                </button>
            </Stack>
        </Dialog>
    );
};

export default CreateRecipesIngredientsDialog;
