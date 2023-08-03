import { Stack } from "../../primitives";
import Input from "../Common/Input";
import Dialog from "../Dialog";

const CreateRecipeDialog = ({ sources, handleSubmit }) => (
    <Dialog id="createRecipeDialog" title="Add recipe" operation="create" submitHandler={handleSubmit}>
        <Stack>
            <Input id="display_name" label="Display name" required />
            <Input id="servings" label="Number of servings" type="number" required />
            <Input id="source" label="Source" list="sources_list" />
            <datalist id="sources_list">
                {sources &&
                    sources.map(({ id, source }) => (
                        <option key={id} value={id}>
                            {source}
                        </option>
                    ))}
            </datalist>
        </Stack>
    </Dialog>
);

export default CreateRecipeDialog;
