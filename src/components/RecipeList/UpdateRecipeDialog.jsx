import { Fragment } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";
import { deleteRows } from "../../supabase";

const UpdateRecipeDialog = ({ recipe, handleSubmit }) => {
    const clickHandler = (event) => {
        event.preventDefault();

        const { id } = event.target.dataset;
        
        console.log(id);
        // deleteRows("recipes_ingredients", id);
    };

    return (
        <Dialog id="updateRecipeDialog" title="Update recipe" operation="update" submitHandler={handleSubmit}>
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
                    {recipe && recipe.recipes_ingredients &&
                        recipe.recipes_ingredients.map((item, index) => (
                            <Fragment key={index}>
                                <Cluster justify="space-between">
                                    <span>{item.ingredient_identifier}</span>
                                    <button type="button" data-id={item.ingredient_identifier}  onClick={clickHandler}>
                                        <Icon label="Remove" icon="trash" />
                                    </button>
                                </Cluster>
                            </Fragment>
                        ))}
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default UpdateRecipeDialog;
