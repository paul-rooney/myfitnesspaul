import { Stack } from "../../primitives";
import Input from "../Common/Input";
import Dialog from "../Common/Dialog";
import styles from "./ingredient-list.module.scss";

const UpdateIngredientDialog = ({ ingredient, handleSubmit }) => (
    <Dialog id="updateIngredientDialog" title="Edit ingredient" operation="update" submitHandler={handleSubmit}>
        <Stack>
            <input defaultValue={ingredient.id} id="id" type="hidden" />
            <Stack space="var(--size-1)">
                <Input defaultValue={ingredient.identifier} id="identifier" label="Identifier" />
            </Stack>
            <Stack space="var(--size-1)">
                <Input defaultValue={ingredient.display_name} id="display_name" label="Display name" required />
            </Stack>
            <Stack space="var(--size-1)">
                <Input defaultValue={ingredient?.grouping} id="grouping" label="Grouping (optional)" />
            </Stack>
            <Stack space="var(--size-1)">
                <Input defaultValue={ingredient?.brand_name} className={styles.input} id="brand_name" label="Brand name" />
            </Stack>
            <Stack space="var(--size-1)">
                <Input className={styles.input} defaultValue={ingredient.kcal} id="kcal" label="kcal" type="number" min={0} max={900} step={1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
            </Stack>
            <Stack space="var(--size-1)">
                <Input className={styles.input} defaultValue={ingredient.carbohydrate} id="carbohydrate" label="Carbohydrate" type="number" min={0} max={100} step={0.1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
            </Stack>
            <Stack space="var(--size-1)">
                <Input className={styles.input} defaultValue={ingredient.fat} id="fat" label="Fat" type="number" min={0} max={100} step={0.1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
            </Stack>
            <Stack space="var(--size-1)">
                <Input className={styles.input} defaultValue={ingredient.protein} id="protein" label="Protein" type="number" min={0} max={100} step={0.1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
            </Stack>
            <Stack space="var(--size-1)">
                <Input className={styles.input} defaultValue={ingredient?.avg_unit_weight} id="avg_unit_weight" label="Average unit weight (optional)" type="number" min={0} max={1000} step={1} />
            </Stack>
        </Stack>
    </Dialog>
);

export default UpdateIngredientDialog;
