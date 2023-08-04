import { useEffect, useState } from "react";
import { Cluster, Icon, Stack } from "../../primitives";
import { supabase, upsertRows } from "../../supabase";
import { formatDate, formatDateISO, getPastDate, getFutureDate } from "../../utilities";
import styles from "./logbook.module.scss";
import MacronutrientDisplay from "../MacronutrientDisplay";
import WeightDisplay from "../WeightDisplay";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import Input from "../Common/Input";

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

const Logbook = ({ recipes }) => {
    const [date, setDate] = useState(formatDateISO(new Date()));
    const [weight, setWeight] = useState(null);
    const [breakfast, setBreakfast] = useState({});
    const [lunch, setLunch] = useState({});
    const [dinner, setDinner] = useState({});

    useEffect(() => {
        getLog("users_weight", "weight", "date_entered", date).then(([entry]) => setWeight(entry?.weight));

        getLog("users_logs", "*, recipes (display_name)", "meal_date", date).then((data) => {
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
    }, [date]);

    const clickHandler = async (event) => {
        const { data } = await supabase.auth.getSession();
        const { meal } = event.target.closest("button").dataset;
        const input = document.getElementById(meal);
        const entry = {
            user_id: data.session.user.id,
            meal_name: null,
            meal_date: date,
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

        const meals = [breakfast, lunch, dinner];

        for (const meal of meals) {
            if (Object.keys(meal).length) {
                const payload = {
                    id: meal?.id,
                    user_id: meal.user_id,
                    meal_name: meal.meal_name,
                    meal_date: date,
                    recipe_id: meal.recipe_id,
                };

                await upsertRows("users_logs", payload, { ignoreDuplicates: false, onConflict: "meal_name_date" });
            }
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
        const { direction } = event.target.closest("button").dataset;

        switch (direction) {
            case "previous":
                setDate((currentValue) => formatDateISO(getPastDate(currentValue, 1)));
                break;

            case "next":
                setDate((currentValue) => formatDateISO(getFutureDate(currentValue, 1)));
                break;

            default:
                break;
        }
    };

    return (
        <Stack>
            <PrimaryHeading>Log</PrimaryHeading>

            {/* <WeightDisplay /> */}

            <Cluster justify="center" align="baseline">
                <Button data-direction="previous" clickHandler={adjustDate}>
                    <Icon space="0.5ch" direction="ltr" icon="chevron-left">
                        Previous
                    </Icon>
                </Button>
                <time>{formatDate(new Date(date))}</time>
                <Button data-direction="next" clickHandler={adjustDate}>
                    <Icon space="0.5ch" icon="chevron-right">
                        Next
                    </Icon>
                </Button>
            </Cluster>

            <MacronutrientDisplay date={date} />

            {/* 
            
            TODO: If date is in the past, require confirmation to enable form fields for update  
            
            */}

            <form onSubmit={logWeight}>
                <Input id="weight" label="Weight" type="number" step={0.25} defaultValue={weight} variant="fancy">
                    <Button variant="secondary" type="submit">
                        <Icon space="0.5ch" direction="ltr" icon="plus">
                            Log weight
                        </Icon>
                    </Button>
                </Input>
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
                    <Input id="breakfast" label="Breakfast" list="recipes_list" placeholder={breakfast?.display_name} variant="fancy">
                        <Button variant="secondary" data-meal="breakfast" clickHandler={clickHandler}>
                            <Icon space="0.5ch" direction="ltr" icon="plus">
                                Add
                            </Icon>
                        </Button>
                    </Input>
                    <Input id="lunch" label="Lunch" list="recipes_list" placeholder={lunch?.display_name} variant="fancy">
                        <Button variant="secondary" data-meal="lunch" clickHandler={clickHandler}>
                            <Icon space="0.5ch" direction="ltr" icon="plus">
                                Add
                            </Icon>
                        </Button>
                    </Input>
                    <Input id="dinner" label="Dinner" list="recipes_list" placeholder={dinner?.display_name} variant="fancy">
                        <Button variant="secondary" data-meal="dinner" clickHandler={clickHandler}>
                            <Icon space="0.5ch" direction="ltr" icon="plus">
                                Add
                            </Icon>
                        </Button>
                    </Input>
                    <Cluster justify="end">
                        <Button variant="primary" fullWidth type="submit">
                            <Icon space="1ch" direction="ltr" icon="check">
                                Complete log
                            </Icon>
                        </Button>
                    </Cluster>
                </Stack>
            </form>
        </Stack>
    );
};

export default Logbook;
