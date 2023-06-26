import { Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./recipe-list.module.scss";

const CreateRecipeDialog = ({ handleSubmit }) => (
    <Dialog
        id="createRecipeDialog"
        title="Add recipe"
        operation="create"
        submitHandler={handleSubmit}
    >
        <Stack>
            <Stack space="var(--size-1)">
                <label
                    className={styles.label}
                    htmlFor="display_name"
                >
                    Display name
                </label>
                <input
                    name="dsplay_name"
                    id="display_name"
                    required
                />
            </Stack>
            <Stack space="var(--size-1)">
                <label
                    className={styles.label}
                    htmlFor="servings"
                >
                    Number of servings
                </label>
                <input
                    id="servings"
                    type="number"
                    required
                />
            </Stack>
        </Stack>
    </Dialog>
);

export default CreateRecipeDialog;
