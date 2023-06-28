import { Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./ingredient-list.module.scss";

const DeleteIngredientDialog = ({ ingredient, handleSubmit }) => (
    <Dialog id="deleteIngredientDialog" title="Delete ingredient" operation="delete" submitHandler={handleSubmit}>
        <Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="identifier">
                    Name
                </label>
                <input defaultValue={ingredient.identifier} id="identifier" disabled />
                <input defaultValue={ingredient?.id} id="id" type="hidden" />
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="display_name">
                    Display name
                </label>
                <input defaultValue={ingredient.display_name} id="display_name" disabled />
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="brand_name">
                    Brand name
                </label>
                <input defaultValue={ingredient?.brand_name} className={styles.input} id="brand_name" disabled />
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="kcal">
                    kcal
                </label>
                <input className={styles.input} defaultValue={ingredient.kcal} id="kcal" type="number" min={0} max={900} step={1} disabled />
                <small className={styles.small}>per 100g/100ml</small>
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="carbohydrate">
                    Carbohydrate
                </label>
                <input className={styles.input} defaultValue={ingredient.carbohydrate} id="carbohydrate" type="number" min={0} max={100} step={0.1} disabled />
                <small className={styles.small}>per 100g/100ml</small>
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="fat">
                    Fat
                </label>
                <input className={styles.input} defaultValue={ingredient.fat} id="fat" type="number" min={0} max={100} step={0.1} disabled />
                <small className={styles.small}>per 100g/100ml</small>
            </Stack>
            <Stack space="var(--size-1)">
                <label className={styles.label} htmlFor="protein">
                    Protein
                </label>
                <input className={styles.input} defaultValue={ingredient.protein} id="protein" type="number" min={0} max={100} step={0.1} disabled />
                <small className={styles.small}>per 100g/100ml</small>
            </Stack>
        </Stack>
    </Dialog>
);

export default DeleteIngredientDialog;
