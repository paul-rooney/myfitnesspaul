import { useEffect, useState } from "react";
import { Cluster, Stack } from "../../primitives";
import { supabase, insertRows, readRows, upsertRows } from "../../supabase";
import { formatDate, formatDateISO, getPastDate, getFutureDate } from "../../utilities";
import styles from "./logbook.module.scss";

const getLog = async (table, columns = "*", date) => {
    try {
        const { data, error } = await supabase.from(table).select(columns).eq("meal_date", date);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const getWeight = async (table, columns = "*", date) => {
    try {
        const { data, error } = await supabase.from(table).select(columns).eq("date_entered", date);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const Logbook = ({ recipes }) => {
    const [weight, setWeight] = useState(null);
    const [breakfast, setBreakfast] = useState([]);
    const [lunch, setLunch] = useState([]);
    const [dinner, setDinner] = useState([]);
    const [displayedDate, setDisplayedDate] = useState(new Date());

    useEffect(() => {
        const date = formatDateISO(displayedDate);

        getWeight("users_weight", "weight", date).then(([entry]) => setWeight(entry.weight));
        getLog("users_logs", "*, recipes (display_name)", date).then((data) => {
            setBreakfast([]);
            setLunch([]);
            setDinner([]);

            data.map((meal) => {
                if (meal.meal_name === "breakfast") {
                    setBreakfast([meal]);
                } else if (meal.meal_name === "lunch") {
                    setLunch([meal]);
                } else {
                    setDinner([meal]);
                }
            });
        });
    }, [displayedDate]);

    const clickHandler = (event) => {
        const { meal } = event.target.dataset;
        const input = document.getElementById(meal);
        const entry = input.value;

        switch (meal) {
            case "breakfast":
                setBreakfast([entry]);
                break;

            case "lunch":
                setLunch([entry]);
                break;

            case "dinner":
                setDinner([entry]);
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

    const adjustDate = (event) => {
        const { direction } = event.target.dataset;

        switch (direction) {
            case "previous":
                setDisplayedDate((currentValue) => getPastDate(currentValue, 1));
                break;

            case "next":
                setDisplayedDate((currentValue) => getFutureDate(currentValue, 1));
                break;

            default:
                break;
        }
    };

    return (
        <>
            <h2 className={styles.heading}>Log</h2>
            <Cluster justify="center" align="baseline">
                <button data-direction="previous" onClick={adjustDate}>
                    Previous
                </button>
                <time>{formatDate(displayedDate, "en-GB")}</time>
                <button data-direction="next" onClick={adjustDate}>
                    Next
                </button>
            </Cluster>

            <form onSubmit={logWeight}>
                <Stack space="var(--size-1)">
                    <label className={styles.label} htmlFor="weight">
                        Weight
                    </label>
                    <input id="weight" type="number" defaultValue={weight} step={0.25} />
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
                                    {entry?.recipes?.display_name}
                                </p>
                            ))}
                        </Stack>
                    </Stack>
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
                                    {entry?.recipes?.display_name}
                                </p>
                            ))}
                        </Stack>
                    </Stack>
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
                                    {entry?.recipes?.display_name}
                                </p>
                            ))}
                        </Stack>
                    </Stack>
                    <Cluster justify="end">
                        <button type="submit">Complete log</button>
                    </Cluster>
                </Stack>
            </form>
        </>
    );
};

export default Logbook;
