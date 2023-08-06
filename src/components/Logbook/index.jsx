import { useEffect, useReducer, useState } from "react";
import { Stack } from "../../primitives";
import { supabase } from "../../supabase";
import { formatDateISO } from "../../utilities";
import MacronutrientDisplay from "../MacronutrientDisplay";
import PrimaryHeading from "../Common/PrimaryHeading";
import DateSelector from "./DateSelector";
import LogWeightForm from "./LogWeightForm";
import LogMealsForm from "./LogMealsForm";

const getLog = async (table, columns = "*", matchedColumn, date) => {
    try {
        const { data, error } = await supabase.from(table).select(columns).eq(matchedColumn, date);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const reducer = (state, action) => ({
    ...state,
    [action.type]: action.details,
});

const Logbook = ({ recipes, ingredients }) => {
    const [date, setDate] = useState(formatDateISO(new Date()));
    const [weight, setWeight] = useState(0);
    const [state, dispatch] = useReducer(reducer, {});

    useEffect(() => {
        getLog("users_weight", "weight", "date_entered", date).then(([entry]) =>
            setWeight((previous) => (entry?.weight ? entry.weight : previous))
        );

        getLog("users_logs", "*, recipes (display_name)", "meal_date", date).then((data) => {
            dispatch({ type: "breakfast", action: {} });
            dispatch({ type: "lunch", action: {} });
            dispatch({ type: "dinner", action: {} });
            dispatch({ type: "snacks", action: {} });

            if (!data.length) return;

            data.map(({ id, user_id, meal_name, meal_date, recipe_id, recipes }) => {
                const entry = {
                    id: id,
                    user_id: user_id,
                    meal_name: meal_name,
                    meal_date: meal_date,
                    recipe_id: recipe_id,
                    display_name: recipes.display_name,
                };

                if (meal_name === "breakfast") {
                    dispatch({ type: "breakfast", details: entry });
                } else if (meal_name === "lunch") {
                    dispatch({ type: "lunch", details: entry });
                } else if (meal_name === "dinner") {
                    dispatch({ type: "dinner", details: entry });
                } else {
                    dispatch({ type: "snacks", details: entry });
                }
            });
        });
    }, [date]);

    return (
        <Stack>
            <PrimaryHeading>Log</PrimaryHeading>

            {/* <WeightDisplay /> */}

            <DateSelector date={date} setDate={setDate} />

            <MacronutrientDisplay date={date} />

            <LogWeightForm weight={weight} setWeight={setWeight} />

            <LogMealsForm date={date} ingredients={ingredients} recipes={recipes} state={state} dispatch={dispatch} />
        </Stack>
    );
};

export default Logbook;
