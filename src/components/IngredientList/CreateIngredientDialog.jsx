import { useState } from "react";
import { Cluster, Stack } from "../../primitives";
import Input from "../Common/Input";
import Dialog from "../Dialog";
import styles from "./ingredient-list.module.scss";

const CreateIngredientDialog = ({ handleSubmit }) => {
    const [isBranded, setIsBranded] = useState(false);

    return (
        <Dialog id="createIngredientDialog" title="Add ingredient" operation="create" submitHandler={handleSubmit}>
            <Stack>
                <Input id="identifier" label="Identifier" required />
                <Input id="grouping" label="Grouping (optional)" />
                <Input id="display_name" label="Display name" required />
                <Cluster align="center" space="var(--size-1)">
                    <label className={styles.label} htmlFor="isBranded">
                        Brand product
                    </label>
                    <input style={{ order: "-1" }} id="isBranded" type="checkbox" onChange={() => setIsBranded(!isBranded)} />
                </Cluster>
                {isBranded && <Input id="brand_name" label="Brand name" required />}
                <Input id="kcal" label="kcal" type="number" min={0} max={900} step={1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
                <Input id="carbohydrate" label="Carbohydrate" type="number" min={0} max={100} step={0.1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
                <Input id="fat" label="Fat" type="number" min={0} max={100} step={0.1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
                <Input id="protein" label="Protein" type="number" min={0} max={100} step={0.1}>
                    <small className={styles.small}>per 100g/100ml</small>
                </Input>
                <Input id="avg_unit_weight" label="Average unit weight (optional)" type="number" min={0} max={1000} step={1} />
            </Stack>
        </Dialog>
    );
};

export default CreateIngredientDialog;
