import { useEffect, useState } from "react";
import { Icon, Stack } from "../../primitives";
import { insertRows, updateRows, deleteRows } from "../../supabase";
import FilterIngredientsForm from "./FilterIngredientsForm";
import CreateIngredientDialog from "./CreateIngredientDialog";
import UpdateIngredientDialog from "./UpdateIngredientDialog";
import DeleteIngredientDialog from "./DeleteIngredientDialog";
import { stripNonAlphanumeric } from "../../utilities";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import IngredientCard from "./IngredientCard";
import Paginator from "../Common/Paginator";
import EmptyState from "../Common/EmptyState";

const IngredientList = ({ ingredients }) => {
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [ingredientToUpdate, setIngredientToUpdate] = useState({});
    const [ingredientToDelete, setIngredientToDelete] = useState({});
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);

    useEffect(() => {
        if (!ingredients) return;

        setFilteredIngredients(ingredients);
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
            carbohydrate: parseFloat(carbohydrate.value) || 0,
            fat: parseFloat(fat.value) || 0,
            protein: parseFloat(protein.value) || 0,
            avg_unit_weight: avg_unit_weight.value ? parseFloat(avg_unit_weight.value) : null,
        };

        switch (operation) {
            case "create":
                insertRows("ingredients", ingredient);
                break;

            case "update":
                ingredient.id = id.value;
                updateRows("ingredients", ingredient);
                setIngredientToUpdate({});
                break;

            case "delete":
                deleteRows("ingredients", id.value);
                setIngredientToDelete({});
                break;

            default:
                break;
        }

        form.reset();
    };

    return (
        <Stack>
            <PrimaryHeading>Ingredients</PrimaryHeading>

            <FilterIngredientsForm ingredients={ingredients} setFilteredIngredients={setFilteredIngredients} />

            <Button variant="primary" fullWidth data-operation="create" clickHandler={clickHandler}>
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Add ingredient
                </Icon>
            </Button>

            <Paginator arrayToPaginate={filteredIngredients} itemsPerPage={10} setStartIndex={setStartIndex} setEndIndex={setEndIndex} />

            <Stack space="var(--size-1)" role="list">
                {filteredIngredients.length > 0 ? (
                    filteredIngredients
                        .sort((a, b) => {
                            if (a.display_name > b.display_name) return 1;
                            if (a.display_name < b.display_name) return -1;
                            return 0;
                        })
                        .slice(startIndex, endIndex)
                        .map((ingredient) => <IngredientCard ingredient={ingredient} clickHandler={clickHandler} role="listitem" key={ingredient.id} />)
                ) : (
                    <EmptyState role="listitem">No ingredients to display</EmptyState>
                )}
            </Stack>

            <CreateIngredientDialog handleSubmit={submitHandler} />
            <UpdateIngredientDialog ingredient={ingredientToUpdate} handleSubmit={submitHandler} />
            <DeleteIngredientDialog ingredient={ingredientToDelete} handleSubmit={submitHandler} />
        </Stack>
    );
};

export default IngredientList;
