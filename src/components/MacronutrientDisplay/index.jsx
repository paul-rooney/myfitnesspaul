import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { formatDateISO } from "../../utilities";
import { Stack } from "../../primitives";
import StackedBar from "./StackedBar";
import EmptyState from "../Common/EmptyState";

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
                servings,
                recipes_ingredients ( 
                    recipes_macronutrients ( kcal, carbohydrate, fat, protein )
                )
            )`,
            date
        ).then((recipes) => {
            const flattenedRecipes = recipes.flatMap((item) => {
                const servings = item.recipes.servings;
                const ingredients = item.recipes.recipes_ingredients;

                return ingredients.map((ingredient) => {
                    return {
                        servings,
                        ...ingredient.recipes_macronutrients,
                    };
                });
            });

            setKcal(() => flattenedRecipes.reduce((acc, { kcal, servings }) => acc + kcal / servings, 0));
            setCarbohydrate(() => flattenedRecipes.reduce((acc, { carbohydrate, servings }) => acc + carbohydrate / servings, 0));
            setFat(() => flattenedRecipes.reduce((acc, { fat, servings }) => acc + fat / servings, 0));
            setProtein(() => flattenedRecipes.reduce((acc, { protein, servings }) => acc + protein / servings, 0));
        });
    }, [date]);

    return (
        <Stack space="var(--size-1)">
            {kcal && carbohydrate && fat && protein ? (
                <>
                    <p style={{ fontSize: "var(--font-size-0)", textAlign: "center" }}>Total kcal: {kcal}</p>
                    <StackedBar kcal={kcal} c={carbohydrate} f={fat} p={protein} />
                </>
            ) : (
                <EmptyState>No data to display</EmptyState>
            )}
        </Stack>
    );
};

export default MacronutrientDisplay;
