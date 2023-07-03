import { useEffect, useState } from "react";
import useSessionStorage from "./hooks/useSessionStorage";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { readRows, signInWithEmail, supabase } from "./supabase";
import { calculateMacronutrientTotals } from "./utilities";
import SignInForm from "./components/SignInForm";
import SnapTabs from "./components/SnapTabs";
import styles from "./app.module.scss";

const App = () => {
    const [session, setSession] = useState(null);
    const [ingredients, setIngredients] = useSessionStorage("ingredients", []);
    const [recipes, setRecipes] = useSessionStorage("recipes", []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session) return;

        if (!!sessionStorage.getItem("ingredients")) {
            readRows("ingredients").then((ingredients) => setIngredients(ingredients));
        }

        if (!!sessionStorage.getItem("recipes")) {
            readRows(
                "recipes",
                `id, display_name, servings, page_number, 
                recipes_ingredients (ingredients!recipes_ingredients_ingredient_id_fkey (display_name), ingredient_identifier, quantity, unit, recipes_macronutrients (kcal, carbohydrate, fat, protein)),
                recipes_sources (source, author, thumbnail_url)`
            ).then((recipes) => setRecipes(calculateMacronutrientTotals(recipes)));
        }
    }, [session]);

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
            <div className={styles.wrapper}>
                <SnapTabs ingredients={ingredients} setIngredients={setIngredients} recipes={recipes} setRecipes={setRecipes} />
            </div>
        );
    }
};

export default App;
