import { Cluster, Stack } from "../../../primitives";
// import styles from "./ingredient-list.module.scss";
import styles from "./macronutrient-values.module.css";

const MacronutrientValues = ({ kcal, c = null, f = null, p = null, unit = null }) => {
    const primaryMacronutrient = Math.max(c, f, p);

    return (
        <Cluster space="var(--size-2)">
            <Stack>
                <span className={styles.label}>kcal</span>
                {kcal}
            </Stack>
            {!!c && (
                <Stack space="0">
                    <span className={styles.label}>Carbohydrate</span>
                    <span className={c === primaryMacronutrient ? styles.highlight : ""}>{c}g</span>
                </Stack>
            )}
            {!!f && (
                <Stack space="0">
                    <span className={styles.label}>Fat</span>
                    <span className={f === primaryMacronutrient ? styles.highlight : ""}>{f}g</span>
                </Stack>
            )}
            {!!p && (
                <Stack space="0">
                    <span className={styles.label}>Protein</span>
                    <span className={p === primaryMacronutrient ? styles.highlight : ""}>{p}g</span>
                </Stack>
            )}
            {unit && (
                <div style={{ marginInlineStart: "auto" }}>
                    <Stack space="0">
                        <span className={styles.label}>Typical weight</span>
                        <span style={{ textAlign: "right" }}>{unit}g</span>
                    </Stack>
                </div>
            )}
        </Cluster>
    );
};

export default MacronutrientValues;
