import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { formatDateISO } from "../../utilities";
import { Cluster } from "../../primitives";
import StackedBar from "./StackedBar";

const getStuff = async (table, columns = "*", date) => {
    try {
        const { data, error } = await supabase.from(table).select(columns).eq("meal_date", formatDateISO(date));
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const MacronutrientDisplay = ({ date }) => {
    const [kcal, setKcal] = useState(0);
    const [carbohydrate, setCarbohydrate] = useState(0);
    const [fat, setFat] = useState(0);
    const [protein, setProtein] = useState(0);

    useEffect(() => {
        getStuff(
            "users_logs",
            `recipes (
                recipes_ingredients ( 
                    recipes_macronutrients ( kcal, carbohydrate, fat, protein )
                )
            )`,
            date
        ).then((recipes) => {
            const x = recipes
                .flatMap((recipe) => recipe.recipes.recipes_ingredients)
                .map((ingredient) => ingredient.recipes_macronutrients);

            setKcal(() => Math.round(x.reduce((acc, ingredient) => acc + ingredient.kcal, 0)));
            setCarbohydrate(() => Math.round(x.reduce((acc, ingredient) => acc + ingredient.carbohydrate, 0)));
            setFat(() => Math.round(x.reduce((acc, ingredient) => acc + ingredient.fat, 0)));
            setProtein(() => Math.round(x.reduce((acc, ingredient) => acc + ingredient.protein, 0)));
        });
    }, [date]);

    return (
        <>
        <Cluster>
            {kcal && carbohydrate && fat && protein ? (
                <>
                Total kcal: {kcal}
                <StackedBar kcal={kcal} c={carbohydrate} f={fat} p={protein} />
                </>
            ) : (
                <p>No data to display</p>
            )}
        </Cluster>
        </>
    );
};

export default MacronutrientDisplay;
