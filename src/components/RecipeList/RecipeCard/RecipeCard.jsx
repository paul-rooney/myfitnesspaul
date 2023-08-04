import { useEffect, useState } from "react";
import { Cluster, Frame, Icon, Stack } from "../../../primitives";
// import styles from "./recipe-list.module.scss";
import styles from "./recipe-card.module.css";
import Button from "../../Common/Button";
import Card from "../../Common/Card";

const RecipeCard = ({ recipe, handleClick, ...attributes }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isAnimatingFullScreen, setIsAnimatingFullScreen] = useState(false);
    const { id, display_name, servings, page_number, total_kcal, total_carbohydrate, total_fat, total_protein, recipes_ingredients: ingredients, recipes_sources: source } = recipe;

    useEffect(() => {
        const cardElement = document.getElementById(`recipeCard_${recipe.id}`);
        cardElement.addEventListener("transitionend", handleTransitionEnd);

        return () => cardElement.removeEventListener("transitionend", handleTransitionEnd);
    }, [recipe.id]);

    const toggleFullScreen = () => {
        setIsAnimatingFullScreen(true);
        setTimeout(() => {
            setIsFullScreen((previous) => !previous);
        }, 300);
    };

    const handleTransitionEnd = () => setIsAnimatingFullScreen(false);

    return (
        <Card {...attributes} padding="var(--size-2)">
            <details id={`recipeCard_${recipe.id}`} className={`${styles.details} ${isFullScreen ? styles.fullScreenCard : ""} ${isAnimatingFullScreen ? styles.animateFullScreen : ""}`} open={isFullScreen}>
                <summary className={styles.summary}>
                    {isFullScreen && source && (
                        <div className={styles.sourceGrid}>
                            <Frame ratio="3:4">
                                <img src={source.thumbnail_url} className={styles.thumbnail} />
                            </Frame>
                            <Stack space="var(--size-2)">
                                <p className={styles.source}>{source.source}</p>
                                <p className={styles.displayName}>{display_name}</p>
                                <p className={styles.pageNumber}>{page_number ? `Page ${page_number}` : "No page number to display"}</p>
                            </Stack>
                        </div>
                    )}
                    <header className={styles.header}>
                        <Stack space="0">
                            <span className={styles.servings}>Serves {servings}</span>
                            <span className={styles.displayName}>{display_name}</span>
                        </Stack>
                        <Cluster space="var(--size-1)" className={styles.buttons}>
                            <Button variant="round" data-id={id} data-operation="update" clickHandler={handleClick}>
                                <Icon icon="edit-3" />
                            </Button>
                            <Button variant="round" data-id={id} data-operation="delete" clickHandler={handleClick}>
                                <Icon icon="trash" />
                            </Button>
                            <Button variant="round" clickHandler={toggleFullScreen}>
                                <Icon icon="maximize-2" />
                            </Button>
                        </Cluster>
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
                                        style={{
                                            backgroundColor: "var(--surface2)",
                                            borderRadius: "var(--radius-2)",
                                            color: "var(--text1)",
                                            fontSize: "var(--font-size-0)",
                                            marginBlock: "0",
                                            padding: "var(--size-1) var(--size-2)",
                                        }}
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
        </Card>
    );
};

export default RecipeCard;
