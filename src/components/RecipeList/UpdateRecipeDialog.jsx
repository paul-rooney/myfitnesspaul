import { Fragment } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";
import { deleteRows } from "../../supabase";

const UpdateRecipeDialog = ({ recipe, handleSubmit }) => {
    const clickHandler = (event) => {
        event.preventDefault();
        const { id, identifier, operation } = event.target.closest("button").dataset;

        switch (operation) {
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
                <Stack>
                    <label>Add another ingredient</label>
                    <input />
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default UpdateRecipeDialog;
