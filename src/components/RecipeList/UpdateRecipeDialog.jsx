import { Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";

const UpdateRecipeDialog = ({ recipe, handleSubmit }) => (
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
        </Stack>
    </Dialog>
);

export default UpdateRecipeDialog;
