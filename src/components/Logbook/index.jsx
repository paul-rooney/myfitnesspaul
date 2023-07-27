import { useEffect, useState } from "react";
import { Box, Cluster, Stack } from "../../primitives";
import { supabase, insertRows, readRows, upsertRows } from "../../supabase";
import { formatDate } from "../../utilities";
import styles from "./logbook.module.scss";

const getTodaysLog = async (table, columns = "*") => {
    const today = new Date(Date.now()).toISOString().slice(0,10);

    try {
        const { data, error } = await supabase.from(table).select(columns).eq("meal_date", today);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const getPreviousWeight = await readRows("users_weight", "weight");

const Logbook = ({ recipes }) => {
    const [previousWeight, setPreviousWeight] = useState(null);
    const [breakfast, setBreakfast] = useState([]);
    const [lunch, setLunch] = useState([]);
    const [dinner, setDinner] = useState([]);

    useEffect(() => {
        if (!getPreviousWeight) return;

        const { weight } = getPreviousWeight[0];

        setPreviousWeight(weight);
    }, []);

    useEffect(() => {
        getTodaysLog("users_logs", "*, recipes (display_name)").then(data => console.log(data))
    }, []);

    const clickHandler = (event) => {
        const { meal } = event.target.dataset;
        const input = document.getElementById(meal);
        const entry = input.value;

        switch (meal) {
            case "breakfast":
                setBreakfast((prev) => [...prev, entry]);
                break;

            case "lunch":
                setLunch((prev) => [...prev, entry]);
                break;

            case "dinner":
                setDinner((prev) => [...prev, entry]);
                break;

            default:
                break;
        }

        input.value = "";
    };

    const submitHandler = async (event) => {
        event.preventDefault();

        const { data } = await supabase.auth.getSession();

        if (!breakfast.length && !lunch.length && !dinner.length) return;

        const breakfastPayload = breakfast.map((entry) => ({
            user_id: data.session.user.id,
            meal_name: "breakfast",
            recipe_id: entry,
        }));

        const lunchPayload = lunch.map((entry) => ({
            user_id: data.session.user.id,
            meal_name: "lunch",
            recipe_id: entry,
        }));

        const dinnerPayload = dinner.map((entry) => ({
            user_id: data.session.user.id,
            meal_name: "dinner",
            recipe_id: entry,
        }));

        insertRows("users_logs", breakfastPayload);
        insertRows("users_logs", lunchPayload);
        insertRows("users_logs", dinnerPayload);
    };

    const logWeight = async (event) => {
        event.preventDefault();

        const { data } = await supabase.auth.getSession();
        const { weight } = event.target;

        const payload = {
            user_id: data.session.user.id,
            weight: weight.value,
        };

        upsertRows("users_weight", payload, { ignoreDuplicates: false, onConflict: "date_entered" });
    };

    return (
        <>
            <h2 className={styles.heading}>Log</h2>
            <time>{formatDate(new Date(), "en-GB")}</time>

            <form onSubmit={logWeight}>
                <Stack space="var(--size-1)">
                    <label className={styles.label} htmlFor="weight">
                        Weight
                    </label>
                    <input id="weight" type="number" defaultValue={previousWeight} step={0.25} />
                    <Cluster justify="end">
                        <button>Log weight</button>
                    </Cluster>
                </Stack>
            </form>

            <form onSubmit={submitHandler}>
                <datalist id="recipes_list">
                    {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                            {recipe.display_name}
                        </option>
                    ))}
                </datalist>
                <Stack>
                    <Box padding="var(--size-2)" borderWidth="1px">
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" align="baseline">
                                <label htmlFor="breakfast">Breakfast</label>
                                <button type="button" data-meal="breakfast" onClick={clickHandler}>
                                    Add
                                </button>
                            </Cluster>
                            <input id="breakfast" list="recipes_list" />
                            <Stack space="var(--size-1)" role="list">
                                {breakfast.map((entry, index) => (
                                    <p className={styles.meals} role="listitem" key={index}>
                                        {entry}
                                    </p>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                    <Box padding="var(--size-2)" borderWidth="1px">
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" align="baseline">
                                <label htmlFor="lunch">Lunch</label>
                                <button type="button" data-meal="lunch" onClick={clickHandler}>
                                    Add
                                </button>
                            </Cluster>
                            <input id="lunch" list="recipes_list" />
                            <Stack space="var(--size-1)" role="list">
                                {lunch.map((entry, index) => (
                                    <p className={styles.meals} role="listitem" key={index}>
                                        {entry}
                                    </p>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                    <Box padding="var(--size-2)" borderWidth="1px">
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" align="center">
                                <label htmlFor="dinner">Dinner</label>
                                <button type="button" data-meal="dinner" onClick={clickHandler}>
                                    Add
                                </button>
                            </Cluster>
                            <input id="dinner" list="recipes_list" />
                            <Stack space="var(--size-1)" role="list">
                                {dinner.map((entry, index) => (
                                    <p className={styles.meals} role="listitem" key={index}>
                                        {entry}
                                    </p>
                                ))}
                            </Stack>
                        </Stack>
                    </Box>
                    <Cluster justify="end">
                        <button type="submit">Complete log</button>
                    </Cluster>
                </Stack>
            </form>
        </>
    );
};

export default Logbook;
