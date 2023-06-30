import { useEffect, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { readRows, signInWithEmail, supabase } from "./supabase";
import SignInForm from "./components/SignInForm";
import SnapTabs from "./components/SnapTabs";
import styles from "./app.module.scss";

const calculateMacronutrientTotals = (recipes) => {
    return recipes.map((item) => ({
        ...item,
        total_kcal: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.kcal + acc, 0) / item.servings),
        total_carbohydrate: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.carbohydrate + acc, 0) / item.servings),
        total_fat: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.fat + acc, 0) / item.servings),
        total_protein: Math.round(item.recipes_ingredients.reduce((acc, ingredient) => ingredient.recipes_macronutrients.protein + acc, 0) / item.servings),
    }));
};

const App = () => {
    const [session, setSession] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session) return;

        readRows("recipes", `id, display_name, servings, recipes_ingredients (ingredients!recipes_ingredients_ingredient_id_fkey (display_name), ingredient_identifier, quantity, unit, recipes_macronutrients (kcal, carbohydrate, fat, protein))`).then((recipes) => setRecipes(calculateMacronutrientTotals(recipes)));
        readRows("ingredients").then((ingredients) => setIngredients(ingredients));
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
