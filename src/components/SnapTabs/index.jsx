import { Box, Stack } from "../../primitives";
import IngredientList from "../IngredientList";
import RecipeList from "../RecipeList";
import Logbook from "../Logbook";
import styles from "./snap-tabs.module.scss";

const SnapTabs = ({ ingredients, setIngredients, recipes, setRecipes }) => {
    return (
        <>
            <div className={styles.tabs}>
                <section className={`${styles.section} ${styles.scroll}`}>
                    <article id="log" className={styles.article}>
                        <Box>
                            <Stack>
                                <Logbook />
                            </Stack>
                        </Box>
                    </article>
                    <article id="recipes" className={styles.article}>
                        <Box>
                            <Stack>
                                <RecipeList ingredients={ingredients} setIngredients={setIngredients} recipes={recipes} setRecipes={setRecipes} />
                            </Stack>
                        </Box>
                    </article>
                    <article id="ingredients" className={styles.article}>
                        <Box>
                            <Stack>
                                <IngredientList ingredients={ingredients} setIngredients={setIngredients} />
                            </Stack>
                        </Box>
                    </article>
                </section>
            </div>
            <footer className={`${styles.footer} ${styles.scroll}`}>
                <Box>
                    <nav className={styles.nav}>
                        <a className={styles.a} href="#log">
                            Log
                        </a>
                        <a className={styles.a} href="#recipes">
                            Recipes
                        </a>
                        <a className={styles.a} href="#ingredients">
                            Ingredients
                        </a>
                        <a className={styles.a} href="#settings" style={{ marginInlineStart: "auto" }}>
                            Settings
                        </a>
                    </nav>
                </Box>
            </footer>
        </>
    );
};

export default SnapTabs;
