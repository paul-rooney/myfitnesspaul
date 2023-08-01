import { useEffect, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import { supabase, insertRows, readRows, upsertRows, updateRows } from "../../supabase";
import { formatDate, formatDateISO, getPastDate, getFutureDate } from "../../utilities";
import styles from "./logbook.module.scss";
import MacronutrientDisplay from "../MacronutrientDisplay";
import WeightDisplay from "../WeightDisplay";
import useSessionStorage from "../../hooks/useSessionStorage";

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
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [weight, setWeight] = useSessionStorage(`users_weight_${formatDateISO(displayedDate)}`, null);
    const [breakfast, setBreakfast] = useState({});
    const [lunch, setLunch] = useState({});
    const [dinner, setDinner] = useState({});

    useEffect(() => {
        const date = formatDateISO(displayedDate);

        if (sessionStorage.getItem(`users_weight_${date}`) && JSON.parse(sessionStorage.getItem(`users_weight_${date}`))) {
            setWeight(JSON.parse(sessionStorage.getItem(`users_weight_${date}`)));
        } else {
            getWeight("users_weight", "weight", date).then(([entry]) => setWeight(entry?.weight));
        }

        getLog("users_logs", "*, recipes (display_name)", date).then((data) => {
            setBreakfast({});
            setLunch({});
            setDinner({});

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
                    setBreakfast(entry);
                } else if (meal_name === "lunch") {
                    setLunch(entry);
                } else {
                    setDinner(entry);
                }
            });
        });
    }, [displayedDate]);

    const clickHandler = async (event) => {
        const { data } = await supabase.auth.getSession();
        const { meal } = event.target.dataset;
        const input = document.getElementById(meal);
        const entry = {
            user_id: data.session.user.id,
            meal_name: null,
            meal_date: formatDateISO(displayedDate),
            recipe_id: input.value,
        };

        switch (meal) {
            case "breakfast":
                entry.meal_name = "breakfast";
                setBreakfast(entry);
                break;

            case "lunch":
                entry.meal_name = "lunch";
                setLunch(entry);
                break;

            case "dinner":
                entry.meal_name = "dinner";
                setDinner(entry);
                break;

            default:
                break;
        }

        input.value = "";
    };

    const submitHandler = async (event) => {
        event.preventDefault();

        if (Object.keys(breakfast).length) {
            const payload = {
                id: breakfast?.id,
                user_id: breakfast.user_id,
                meal_name: breakfast.meal_name,
                meal_date: formatDateISO(displayedDate),
                recipe_id: breakfast.recipe_id,
            };

            upsertRows("users_logs", payload, { ignoreDuplicates: false, onConflict: "meal_name_date" });
        }

        if (Object.keys(lunch).length) {
            const payload = {
                id: lunch?.id,
                user_id: lunch.user_id,
                meal_name: lunch.meal_name,
                meal_date: formatDateISO(displayedDate),
                recipe_id: lunch.recipe_id,
            };

            upsertRows("users_logs", payload, { ignoreDuplicates: false, onConflict: "meal_name_date" });
        }

        if (Object.keys(dinner).length) {
            const payload = {
                id: dinner?.id,
                user_id: dinner.user_id,
                meal_name: dinner.meal_name,
                meal_date: formatDateISO(displayedDate),
                recipe_id: dinner.recipe_id,
            };

            upsertRows("users_logs", payload, { ignoreDuplicates: false, onConflict: "meal_name_date" });
        }
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
            {/* <WeightDisplay /> */}
            <MacronutrientDisplay date={displayedDate} />
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
                        <button className={styles.button}>Log weight</button>
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
                <Stack space="var(--size-4)">
                    <Stack space="var(--size-1)">
                        <Cluster justify="space-between" align="baseline">
                            <label htmlFor="breakfast">Breakfast</label>
                            <button className={styles.button} type="button" data-meal="breakfast" onClick={clickHandler}>
                                <Icon space="0.5ch" direction="ltr" icon="plus">Add</Icon>
                            </button>
                        </Cluster>
                        <input id="breakfast" list="recipes_list" placeholder={breakfast?.display_name} />
                        {/* <Stack space="var(--size-1)" role="list">
                            <p className={styles.meals} role="listitem">
                                {breakfast?.display_name}
                            </p>
                        </Stack> */}
                    </Stack>
                    <Stack space="var(--size-1)">
                        <Cluster justify="space-between" align="baseline">
                            <label htmlFor="lunch">Lunch</label>
                            <button className={styles.button} type="button" data-meal="lunch" onClick={clickHandler}>
                                <Icon space="0.5ch" direction="ltr" icon="plus">Add</Icon>
                            </button>
                        </Cluster>
                        <input id="lunch" list="recipes_list" placeholder={lunch?.display_name} />
                        {/* <Stack space="var(--size-1)" role="list">
                            <p className={styles.meals} role="listitem">
                                {lunch?.display_name}
                            </p>
                        </Stack> */}
                    </Stack>
                    <Stack space="var(--size-1)">
                        <Cluster justify="space-between" align="center">
                            <label htmlFor="dinner">Dinner</label>
                            <button className={styles.button} type="button" data-meal="dinner" onClick={clickHandler}>
                                <Icon space="0.5ch" direction="ltr" icon="plus">Add</Icon>
                            </button>
                        </Cluster>
                        <input id="dinner" list="recipes_list" placeholder={dinner?.display_name} />
                        {/* <Stack space="var(--size-1)" role="list">
                            <p className={styles.meals} role="listitem">
                                {dinner?.display_name}
                            </p>
                        </Stack> */}
                    </Stack>
                    <Cluster justify="end">
                        <button className={styles.button} type="submit">
                            <Icon space="1ch" direction="rtl" icon="check">Complete log</Icon>
                        </button>
                    </Cluster>
                </Stack>
            </form>
        </>
    );
};

export default Logbook;
