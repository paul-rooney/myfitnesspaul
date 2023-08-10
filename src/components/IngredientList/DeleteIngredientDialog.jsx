import { Stack } from "../../primitives";
import Input from "../Common/Input";
import Dialog from "../Common/Dialog";
import styles from "./ingredient-list.module.scss";

const DeleteIngredientDialog = ({ ingredient, handleSubmit }) => (
    <Dialog id="deleteIngredientDialog" title="Delete ingredient" operation="delete" submitHandler={handleSubmit}>
        <Stack>
            <Input defaultValue={ingredient.identifier} id="identifier" label="Identifier" disabled />
            <input defaultValue={ingredient?.id} id="id" type="hidden" />
            <Input defaultValue={ingredient.display_name} id="display_name" label="Display name" disabled />
            <Input defaultValue={ingredient?.brand_name} id="brand_name" label="Brand name" disabled />
            <Input defaultValue={ingredient.kcal} id="kcal" label="kcal" type="number" min={0} max={900} step={1} disabled>
                <small className={styles.small}>per 100g/100ml</small>
            </Input>
            <Input defaultValue={ingredient.carbohydrate} id="carbohydrate" label="Carbohydrate" type="number" min={0} max={100} step={0.1} disabled>
                <small className={styles.small}>per 100g/100ml</small>
            </Input>
            <Input defaultValue={ingredient.fat} id="fat" label="Fat" type="number" min={0} max={100} step={0.1} disabled>
                <small className={styles.small}>per 100g/100ml</small>
            </Input>
            <Input defaultValue={ingredient.protein} id="protein" label="Protein" type="number" min={0} max={100} step={0.1} disabled>
                <small className={styles.small}>per 100g/100ml</small>
            </Input>
            <Input defaultValue={ingredient.avg_unit_weight} id="avg_unit_weight" label="Average unit weight (optional)" type="number" min={0} max={100} step={1} disabled>
                <small className={styles.small}>per 100g/100ml</small>
            </Input>
        </Stack>
    </Dialog>
);

export default DeleteIngredientDialog;
