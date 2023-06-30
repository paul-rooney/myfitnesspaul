import { Cluster, Icon, Stack } from "../../primitives";
import styles from "./recipe-list.module.scss";

const RecipeCard = ({ recipe }) => {
    const { display_name, servings, total_kcal, total_carbohydrate, total_fat, total_protein, recipes_ingredients: ingredients } = recipe;

    return (
        <details className={styles.details}>
            <summary className={styles.summary}>
                <header className={styles.header}>
                    <Stack space="0">
                        <span className={styles.servings}>Serves {servings}</span>
                        <span className={styles.displayName}>{display_name}</span>
                    </Stack>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: "var(--size-1)",
                        }}
                    >
                        <button className={styles.editButton} onClick={() => clickHandler(name)}>
                            <Icon icon="edit-3" />
                        </button>
                        <button className={styles.deleteButton} onClick={() => clickHandler(name)}>
                            <Icon icon="trash-2" />
                        </button>
                    </div>
                </header>
                <Cluster space="var(--size-2)">
                    <Stack>
                        <span className={styles.label}>kcal</span>
                        {total_kcal}
                    </Stack>
                    <Stack>
                        <span className={styles.label}>Carbohydrate</span>
                        {total_carbohydrate}
                    </Stack>
                    <Stack>
                        <span className={styles.label}>Fat</span>
                        {total_fat}
                    </Stack>
                    <Stack>
                        <span className={styles.label}>Protein</span>
                        {total_protein}
                    </Stack>
                </Cluster>
            </summary>
            {ingredients && (
                <Stack>
                    <Cluster space="var(--size-1)">
                        {ingredients.map(({ ingredient_identifier, ingredients, recipes_macronutrients: macronutrients }) => {
                            const primaryMacronutrient = Math.max(macronutrients.carbohydrate, macronutrients.fat, macronutrients.protein);

                            return (
                                <p
                                    key={ingredient_identifier}
                                    className={macronutrients.carbohydrate === primaryMacronutrient ? styles.highlightCarbohydrate : macronutrients.fat === primaryMacronutrient ? styles.highlightFat : styles.highlightProtein}
                                    style={{ backgroundColor: "var(--gray-6)", borderRadius: "var(--radius-2)", color: "var(--gray-0)", fontSize: "var(--font-size-0)", marginBlock: "0", padding: "var(--size-1) var(--size-2)" }}
                                >
                                    {ingredients.display_name}
                                </p>
                            );
                        })}
                    </Cluster>
                    <ul style={{ listStyleType: "none", paddingInlineStart: "0" }}>
                        {ingredients.map(({ ingredients, quantity, unit }, index) => (
                            <li key={index} style={{ fontSize: "var(--font-size-0)", paddingInlineStart: "0" }}>
                                <Cluster justify="space-between" space="var(--size-3)">
                                    <span>{ingredients.display_name}</span>{" "}
                                    <span>
                                        {quantity} {unit}
                                    </span>
                                </Cluster>
                            </li>
                        ))}
                    </ul>
                </Stack>
            )}
        </details>
    );
};

export default RecipeCard;
