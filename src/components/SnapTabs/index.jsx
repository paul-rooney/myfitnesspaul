import { Box, Stack } from "../../primitives";
import Logbook from "../Logbook";
import MealPlanner from "../MealPlanner";
import RecipeList from "../RecipeList";
import IngredientList from "../IngredientList";
import styles from "./snap-tabs.module.scss";

const SnapTabs = ({ ingredients, setIngredients, recipes, setRecipes }) => {
    return (
        <>
            <div className={styles.tabs}>
                <section className={`${styles.section} ${styles.scroll}`}>
                    <Box id="log" className={styles.article}>
                        <Stack>
                            <Logbook recipes={recipes} />
                        </Stack>
                    </Box>
                    <Box id="mealPlanner" className={styles.article}>
                        <Stack>
                            <MealPlanner recipes={recipes} />
                        </Stack>
                    </Box>
                    <Box id="recipes" className={styles.article}>
                        <Stack>
                            <RecipeList ingredients={ingredients} setIngredients={setIngredients} recipes={recipes} setRecipes={setRecipes} />
                        </Stack>
                    </Box>
                    <Box id="ingredients" className={styles.article}>
                        <Stack>
                            <IngredientList ingredients={ingredients} setIngredients={setIngredients} />
                        </Stack>
                    </Box>
                </section>
            </div>
            <footer className={`${styles.footer} ${styles.scroll}`}>
                <Box>
                    <nav className={styles.nav}>
                        <a className={styles.a} href="#log">
                            Log
                        </a>
                        <a className={styles.a} href="#mealPlanner">
                            Meal Planner
                        </a>
                        <a className={styles.a} href="#recipes">
                            Recipes
                        </a>
                        <a className={styles.a} href="#ingredients">
                            Ingredients
                        </a>
                        {/* <a className={styles.a} href="#settings" style={{ marginInlineStart: "auto" }}>
                            Settings
                        </a> */}
                    </nav>
                </Box>
            </footer>
        </>
    );
};

export default SnapTabs;
