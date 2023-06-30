import { Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";

const DeleteRecipeDialog = ({ recipe, handleSubmit }) => (
    <Dialog id="deleteRecipeDialog" title="Delete recipe" operation="delete" submitHandler={handleSubmit}>
        <Stack>
            <input id="id" hidden defaultValue={recipe.id} />
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="display_name">
                    Display name
                </label>
                <input name="display_name" id="display_name" required disabled defaultValue={recipe.display_name} />
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="servings">
                    Number of servings
                </label>
                <input id="servings" type="number" required disabled defaultValue={recipe.servings} />
            </Stack>
        </Stack>
    </Dialog>
);

export default DeleteRecipeDialog;
