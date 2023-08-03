import { Fragment, useEffect, useState } from "react";
import { deleteRows, insertRows, updateRows } from "../../supabase";
import { Cluster, Icon, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";
import Button from "../Common/Button";
import Input from "../Common/Input";

const updateStarRating = (selector, dependency) => {
    const array = Array.from(document.querySelectorAll(selector));

    array.forEach((element) => element.classList.remove(`${styles.active}`));

    for (let index = 0; index < dependency; index++) {
        const element = array[index];
        element.classList.add(`${styles.active}`);
    }
};

const UpdateRecipeDialog = ({ recipe, ingredients }) => {
    const [recipeIngredients, setRecipeIngredients] = useState([]);
    const [ingredientID, setIngredientID] = useState(null);
    const [pageNumber, setPageNumber] = useState(recipe.page_number ?? null);
    const [rating, setRating] = useState(recipe.rating ?? 0);
    const [effort, setEffort] = useState(recipe.effort ?? 0);

    useEffect(() => {
        setPageNumber(recipe.page_number ?? null);
        setRating(recipe.rating ?? 0);
        setEffort(recipe.effort ?? 0);
    }, [recipe]);

    useEffect(() => {
        updateStarRating("[data-rating]", rating);
    }, [rating]);

    useEffect(() => {
        updateStarRating("[data-effort]", effort);
    }, [effort]);

    const blurHandler = (event) => {
        const { value } = event.target;
        const [item] = ingredients.filter((item) => item.identifier === value);

        if (!item) return;

        const { id } = item;

        setIngredientID(id);
    };

    const changeHandler = (event) => {
        const pageNumber = event.target.value ? event.target.value : null;

        setPageNumber(pageNumber);
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

    const submitHandler = (event) => {
        const { id } = event.target;

        console.log(pageNumber);

        const payload = {
            id: id.value,
            rating: rating,
            effort: effort,
            page_number: pageNumber,
        };

        // this handler being called within this component is preventing the handler running for changes to display name and servings
        updateRows("recipes", payload).catch((error) => console.error(error));

        insertRows("recipes_ingredients", recipeIngredients)
            .catch((error) => console.error(error))
            .finally(() => {
                setRecipeIngredients([]);
            });
    };

    return (
        <Dialog id="updateRecipeDialog" title="Update recipe" submitHandler={submitHandler}>
            <Stack>
                <h3 style={{ fontSize: "var(--font-size-0)", fontWeight: "var(--font-weight-4)" }}>{recipe?.recipes_sources?.source}</h3>
                <input id="id" hidden defaultValue={recipe.id} />
                <input id="source" hidden defaultValue={recipe.source} />
                <Input id="page_number" label="Page number" defaultValue={pageNumber} onChange={changeHandler} />
                <Input name="display_name" id="display_name" laebl="Display name" required defaultValue={recipe.display_name} />
                <Input id="servings" label="Number of servings" type="number" required defaultValue={recipe.servings} />
                <Input id="rating" label="Rating" type="number" defaultValue={recipe.rating} min={1} max={5} step={1} hidden readOnly>
                    <Cluster space="var(--size-1)">
                        <button type="button" className={styles.starRating} data-rating={1} onClick={() => setRating(1)}>
                            <Icon label="1 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-rating={2} onClick={() => setRating(2)}>
                            <Icon label="2 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-rating={3} onClick={() => setRating(3)}>
                            <Icon label="3 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-rating={4} onClick={() => setRating(4)}>
                            <Icon label="4 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-rating={5} onClick={() => setRating(5)}>
                            <Icon label="5 out of 5" icon="star"></Icon>
                        </button>
                    </Cluster>
                </Input>
                <Input id="effort" label="Effort" type="number" value={rating} min={1} max={5} step={1} hidden readOnly>
                    <Cluster space="var(--size-1)">
                        <button type="button" className={styles.starRating} data-effort={1} onClick={() => setEffort(1)}>
                            <Icon label="1 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-effort={2} onClick={() => setEffort(2)}>
                            <Icon label="2 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-effort={3} onClick={() => setEffort(3)}>
                            <Icon label="3 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-effort={4} onClick={() => setEffort(4)}>
                            <Icon label="4 out of 5" icon="star"></Icon>
                        </button>
                        <button type="button" className={styles.starRating} data-effort={5} onClick={() => setEffort(5)}>
                            <Icon label="5 out of 5" icon="star"></Icon>
                        </button>
                    </Cluster>
                </Input>

                <Stack space="var(--size-2)">
                    {recipe &&
                        recipe.recipes_ingredients &&
                        recipe.recipes_ingredients.map((item, index) => (
                            <Fragment key={index}>
                                <Cluster space="var(--size-2)">
                                    <span style={{ marginInlineEnd: "auto" }}>{item.ingredients.display_name}</span>
                                    <Button variant="round" data-id={item.id} data-identifier={item.ingredient_identifier} data-operation="update" clickHandler={clickHandler}>
                                        <Icon label="Update" icon="edit" />
                                    </Button>
                                    <Button variant="round" data-id={item.id} data-identifier={item.ingredient_identifier} data-operation="delete" clickHandler={clickHandler}>
                                        <Icon label="Remove" icon="trash" />
                                    </Button>
                                </Cluster>
                            </Fragment>
                        ))}
                </Stack>
                <fieldset>
                    <legend>Add ingredient</legend>
                    <Stack>
                        <input id="recipe_id" hidden readOnly defaultValue={recipe?.id} />
                        <input id="ingredient_id" hidden defaultValue={ingredientID ?? ""} />
                        <Input id="ingredient_identifier" label="Identifier" list="ingredients_list" onBlur={blurHandler} />
                        <datalist id="ingredients_list">
                            {ingredients.map((item) => (
                                <option key={item.id}>{item.identifier}</option>
                            ))}
                        </datalist>
                        <Input id="quantity" label="Quantity" type="number" />
                        <Input placeholder="Leave blank to use the typical unit weight" id="unit" label="Unit (optional)" list="units" />
                        <datalist id="units">
                            <option>g</option>
                            <option>ml</option>
                            <option>tbsp</option>
                            <option>tsp</option>
                        </datalist>
                        <Button variant="primary" fullWidth clickHandler={addIngredientToList}>
                            Add
                        </Button>
                    </Stack>
                </fieldset>
            </Stack>
        </Dialog>
    );
};

export default UpdateRecipeDialog;
