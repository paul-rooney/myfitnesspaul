import { useEffect, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import { listen, insertRow, updateRow, deleteRow } from "../../supabase";
import FilterIngredientsForm from "./FilterIngredientsForm";
import MacronutrientValues from "./MacronutrientValues";
import CreateIngredientDialog from "./CreateIngredientDialog";
import UpdateIngredientDialog from "./UpdateIngredientDialog";
import DeleteIngredientDialog from "./DeleteIngredientDialog";
import styles from "./ingredient-list.module.scss";
import { stripNonAlphanumeric } from "../../utilities";

const IngredientList = ({ ingredients, setIngredients }) => {
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [ingredientToUpdate, setIngredientToUpdate] = useState({});
    const [ingredientToDelete, setIngredientToDelete] = useState({});

    useEffect(() => {
        if (!ingredients) return;

        setFilteredIngredients(ingredients);
        listen("ingredients", setIngredients);
    }, [ingredients]);

    const clickHandler = async (event) => {
        const { id, operation } = event.target.closest("button").dataset;
        const [item] = ingredients.filter((item) => item.id === id);
        let dialog;

        switch (operation) {
            case "create":
                dialog = document.getElementById("createIngredientDialog");
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
        const { id, identifier, grouping, display_name, brand_name, kcal, carbohydrate, fat, protein, avg_unit_weight } = form;
        let ingredient = {
            identifier: stripNonAlphanumeric(identifier.value).trim().toLowerCase(),
            grouping: grouping.value ? stripNonAlphanumeric(grouping.value).trim().toLowerCase() : null,
            display_name: display_name.value.trim(),
            brand_name: brand_name ? brand_name.value.trim() : null,
            kcal: parseInt(kcal.value),
            carbohydrate: parseFloat(carbohydrate.value),
            fat: parseFloat(fat.value),
            protein: parseFloat(protein.value),
            avg_unit_weight: avg_unit_weight.value ? parseFloat(avg_unit_weight.value) : null,
        };

        switch (operation) {
            case "create":
                insertRow("ingredients", ingredient);
                break;

            case "update":
                ingredient.id = id.value;
                updateRow("ingredients", ingredient);
                setIngredientToUpdate({});

                break;

            case "delete":
                deleteRow("ingredients", id.value);
                setIngredientToDelete({});

                break;

            default:
                break;
        }

        form.reset();
    };

    return (
        <>
            <h2 className={styles.heading}>Ingredients</h2>

            <FilterIngredientsForm ingredients={ingredients} setFilteredIngredients={setFilteredIngredients} />

            <button className={styles.addButton} data-operation="create" onClick={clickHandler}>
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Add ingredient
                </Icon>
            </button>

            <ul className={styles.ul}>
                {filteredIngredients.length > 0 ? (
                    filteredIngredients
                        .sort((a, b) => {
                            if (a.display_name > b.display_name) return 1;
                            if (a.display_name < b.display_name) return -1;
                            return 0;
                        })
                        .map(({ brand_name, carbohydrate, display_name, fat, id, kcal, protein, avg_unit_weight }) => (
                            <li className={styles.li} key={id}>
                                <details className={styles.details}>
                                    <summary className={styles.summary}>
                                        <header className={styles.header}>
                                            <Stack space="0">
                                                {brand_name && <span className={styles.brandName}>{brand_name}</span>}
                                                <span className={styles.displayName}>{display_name}</span>
                                            </Stack>
                                            <Cluster space="var(--size-1)">
                                                <button className={styles.editButton} data-id={id} data-operation="update" onClick={clickHandler}>
                                                    <Icon icon="edit-3" />
                                                </button>
                                                <button className={styles.deleteButton} data-id={id} data-operation="delete" onClick={clickHandler}>
                                                    <Icon icon="trash-2" />
                                                </button>
                                            </Cluster>
                                        </header>
                                    </summary>
                                    <MacronutrientValues kcal={kcal} c={carbohydrate} f={fat} p={protein} unit={avg_unit_weight} />
                                </details>
                            </li>
                        ))
                ) : (
                    <li>No ingredients found</li>
                )}
            </ul>
            <CreateIngredientDialog handleSubmit={submitHandler} />
            <UpdateIngredientDialog ingredient={ingredientToUpdate} handleSubmit={submitHandler} />
            <DeleteIngredientDialog ingredient={ingredientToDelete} handleSubmit={submitHandler} />
        </>
    );
};

export default IngredientList;
