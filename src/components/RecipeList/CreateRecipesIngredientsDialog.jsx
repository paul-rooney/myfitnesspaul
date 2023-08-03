import { useState } from "react";
import { deleteRows, insertRows } from "../../supabase";
import { Icon, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";
import Button from "../Common/Button";
import Input from "../Common/Input";

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

        insertRows("recipes_ingredients", recipeIngredients)
            .catch((error) => console.error(error))
            .finally(() => {
                setRecipeIngredients([]);
            });
    };

    const closeHandler = (event) => {
        const { returnValue } = event.target;

        if (returnValue === "close") {
            deleteRows("recipes", recipe.id);
            setRecipeIngredients([]);
        }
    };

    return (
        <Dialog id="createRecipesIngredientsDialog" title="Add ingredients" operation="create" submitHandler={submitHandler} closeHandler={closeHandler}>
            <Stack>
                {recipeIngredients &&
                    recipeIngredients.map((item, index) => (
                        <p style={{ fontSize: "var(--size-0)", marginBlock: "0" }} key={index}>
                            {item.ingredient_identifier}
                        </p>
                    ))}
                <input id="recipe_id" hidden defaultValue={recipe?.id} />
                <input id="ingredient_id" hidden required defaultValue={ingredientID ?? ""} />
                <Input id="ingredient_identifier" label="Ingredient" list="ingredients_list" onBlur={blurHandler} />
                <datalist id="ingredients_list">
                    {ingredients.map((item) => (
                        <option key={item.id}>{item.identifier}</option>
                    ))}
                </datalist>
                <Input id="quantity" label="Quantity" type="number" />
                <Input id="unit" label="Unit (optional)" list="units">
                    <small className={styles.small}>Leave blank to use the typical unit weight</small>
                </Input>
                <datalist id="units">
                    <option>g</option>
                    <option>ml</option>
                    <option>tbsp</option>
                    <option>tsp</option>
                </datalist>
                <Button variant="primary" fullWidth clickHandler={addIngredientToList}>
                    <Icon space="0.5ch" direction="ltr" icon="plus">
                        Add
                    </Icon>
                </Button>
            </Stack>
        </Dialog>
    );
};

export default CreateRecipesIngredientsDialog;
