import { Stack } from "../../../primitives";
import Input from "../../Common/Input";
import Dialog from "../../Dialog";
import styles from "./delete-recipe-dialog.module.scss";

const DeleteRecipeDialog = ({ recipe, handleSubmit }) => (
    <Dialog id="deleteRecipeDialog" title="Delete recipe" operation="delete" submitHandler={handleSubmit}>
        <Stack>
            <input id="source" hidden defaultValue={recipe.source} />
            <input id="id" hidden defaultValue={recipe.id} />
            <Input id="display_name" label="Display name" required disabled defaultValue={recipe.display_name} />
            <Input id="servings" label="Number of servings" type="number" required disabled defaultValue={recipe.servings} />
        </Stack>
    </Dialog>
);

export default DeleteRecipeDialog;
