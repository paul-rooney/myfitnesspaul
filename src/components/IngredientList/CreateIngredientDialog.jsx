import { useState } from "react";
import { Cluster, Stack } from "../../primitives";
import Dialog from "../Dialog";
import styles from "./ingredient-list.module.scss";

const CreateIngredientDialog = ({ handleSubmit }) => {
    const [isBranded, setIsBranded] = useState(false);

    return (
        <Dialog
            id="createIngredientDialog"
            title="Add ingredient"
            operation="create"
            submitHandler={handleSubmit}
        >
            <Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="identifier"
                    >
                        Identifier
                    </label>
                    <input
                        id="identifier"
                        required
                    />
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="grouping"
                    >
                        Grouping <span>(optional)</span>
                    </label>
                    <input
                        id="grouping"
                    />
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="display_name"
                    >
                        Display name
                    </label>
                    <input
                        id="display_name"
                        required
                    />
                </Stack>
                <Cluster
                    align="center"
                    space="var(--size-1)"
                >
                    <label
                        className={styles.label}
                        htmlFor="isBranded"
                    >
                        Brand product
                    </label>
                    <input
                        style={{ order: "-1" }}
                        id="isBranded"
                        type="checkbox"
                        onChange={() => setIsBranded(!isBranded)}
                    />
                </Cluster>
                {isBranded && (
                    <Stack space="var(--size-1)">
                        <label
                            className={styles.label}
                            htmlFor="brand_name"
                        >
                            Brand name
                        </label>
                        <input
                            className={styles.input}
                            id="brand_name"
                            required
                        />
                    </Stack>
                )}
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="kcal"
                    >
                        kcal
                    </label>
                    <input
                        className={styles.input}
                        id="kcal"
                        type="number"
                        min={0}
                        max={900}
                        step={1}
                    />
                    <small className={styles.small}>per 100g/100ml</small>
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="carbohydrate"
                    >
                        Carbohydrate
                    </label>
                    <input
                        className={styles.input}
                        id="carbohydrate"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                    />
                    <small className={styles.small}>per 100g/100ml</small>
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="fat"
                    >
                        Fat
                    </label>
                    <input
                        className={styles.input}
                        id="fat"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                    />
                    <small className={styles.small}>per 100g/100ml</small>
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="protein"
                    >
                        Protein
                    </label>
                    <input
                        className={styles.input}
                        id="protein"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                    />
                    <small className={styles.small}>per 100g/100ml</small>
                </Stack>
                <Stack space="var(--size-1)">
                    <label
                        className={styles.label}
                        htmlFor="avg_unit_weight"
                    >
                        Average unit weight <span>(optional)</span>
                    </label>
                    <input
                        className={styles.input}
                        id="avg_unit_weight"
                        type="number"
                        min={0}
                        max={1000}
                        step={0.1}
                    />
                    <small className={styles.small}>per 100g/100ml</small>
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default CreateIngredientDialog;
