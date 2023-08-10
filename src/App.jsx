import { useEffect, useState } from "react";
import useSessionStorage from "./hooks/useSessionStorage";
import useLocalStorage from "./hooks/useLocalStorage";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { readRows, signInWithEmail, supabase } from "./supabase";
import { calculateMacronutrientTotals } from "./utilities";
import SignInForm from "./components/SignInForm";
import SnapTabs from "./components/SnapTabs";
import MenuBar from "./components/Common/MenuBar";
import styles from "./app.module.scss";

const recipesQuery = `id, display_name, servings, page_number, rating, effort, recipes_ingredients (ingredients!recipes_ingredients_ingredient_id_fkey (display_name), id, ingredient_identifier, quantity, unit, recipes_macronutrients (kcal, carbohydrate, fat, protein)), recipes_sources (source, author, thumbnail_url)`;

const App = () => {
    const [session, setSession] = useState(null);
    const [ingredients, setIngredients] = useSessionStorage("ingredients", []);
    const [recipes, setRecipes] = useSessionStorage("recipes", []);
    const [theme, setTheme] = useLocalStorage("theme", "dark");

    useEffect(() => {
        document.documentElement.setAttribute("color-scheme", theme);
    }, [theme]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session) return;

        readRows("ingredients").then((ingredients) => setIngredients(ingredients));
        readRows("recipes", recipesQuery).then((recipes) => setRecipes(calculateMacronutrientTotals(recipes)));
    }, [session]);

    useEffect(() => {
        supabase
            .channel("any")
            .on("postgres_changes", { event: "*", schema: "public" }, () => {
                readRows("ingredients").then((ingredients) => setIngredients(ingredients));
                readRows("recipes", recipesQuery).then((recipes) => setRecipes(calculateMacronutrientTotals(recipes)));
            })
            .subscribe();
    }, []);

    const submitHandler = (event) => {
        event.preventDefault();

        const form = event.target;
        const { email, password } = form;

        const credentials = {
            email: email.value,
            password: password.value,
        };

        signInWithEmail(credentials);
    };

    if (!session) {
        return <SignInForm handleSubmit={submitHandler} />;
    } else {
        return (
            <>
                <div className={styles.wrapper}>
                    <MenuBar theme={theme} setTheme={setTheme} />
                    <SnapTabs ingredients={ingredients} setIngredients={setIngredients} recipes={recipes} setRecipes={setRecipes} />
                </div>
            </>
        );
    }
};

export default App;
