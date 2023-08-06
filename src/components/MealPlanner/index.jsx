import { useEffect, useReducer, useState } from "react";
import { Stack, Switcher } from "../../primitives";
import { supabase } from "../../supabase";
import { shuffleArray } from "../../utilities";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import Input from "../Common/Input";
import MealPlan from "./MealPlan";
import ShoppingList from "./ShoppingList";

function getRandomCombinations(objects, range1, range2, n) {
    const shuffledObjects = shuffleArray(objects);

    const combinations = [];
    const uniqueCombinations = new Set();
    const stack = [{ arr: [], kcalSum: 0, proteinSum: 0, index: 0 }];

    while (stack.length > 0 && uniqueCombinations.size < n) {
        const { arr, kcalSum, proteinSum, index } = stack.pop();
        const currentObject = shuffledObjects[index];

        const newKcalSum = kcalSum + currentObject.kcal;
        const newProteinSum = proteinSum + currentObject.protein;

        if (
            newKcalSum >= range1[0] &&
            newKcalSum <= range1[1] &&
            newProteinSum >= range2[0] &&
            newProteinSum <= range2[1]
        ) {
            const combination = [...arr, currentObject];
            const combinationString = JSON.stringify(combination);

            if (!uniqueCombinations.has(combinationString)) {
                uniqueCombinations.add(combinationString);
                combinations.push(combination);
            }
        }

        if (newKcalSum > range1[1] || newProteinSum > range2[1] || index >= shuffledObjects.length - 1) {
            continue;
        }

        stack.push({
            arr: [...arr, currentObject],
            kcalSum: newKcalSum,
            proteinSum: newProteinSum,
            index: index + 1,
        });
        stack.push({ arr, kcalSum, proteinSum, index: index + 1 });
    }

    return combinations.slice(0, n);
}

const read = async (table, columns = "*") => {
    try {
        const { data, error } = await supabase.from(table).select(columns);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const getWeight = async () => {
    const getMeanWeight = (arr) => arr.reduce((acc, value) => acc + value, 0) / arr.length;

    const weightData = await read("users_weight");
    // const { weight } = weightData.pop();
    const weight = weightData.slice(-7).map((value) => value.weight);
    const meanWeight = getMeanWeight(weight);

    return meanWeight;
};

const mifflinStJeorEquation = (weight, height, age) => {
    return 10 * (weight / 2.205) + 6.25 * height - 5 * 32 + 5;
};

const initialState = {
    minKcal: 1450,
    maxKcal: 1550,
    minProtein: 105,
    maxProtein: 165,
};

const reducer = (state, action) => ({ ...state, [action.type]: action.details });

const MealPlanner = ({ recipes }) => {
    const [weight, setWeight] = useState(null);
    const [mealPlan, setMealPlan] = useState([]);
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        getWeight().then((weightValue) => setWeight(weightValue));
        // ⬆️ what is this doing?
        dispatch({ minProtein: weight * 0.7 });
        dispatch({ maxProtein: weight * 1.1 });
    }, [weight]);

    const changeHandler = (event) => {
        const { value, id } = event.target;

        switch (id) {
            case "minKcal":
                dispatch({ type: "minKcal", details: value ?? 0 });
                break;

            case "maxKcal":
                dispatch({ type: "maxKcal", details: value ?? 0 });
                break;

            case "minProtein":
                dispatch({ type: "minProtein", details: value ?? 0 });
                break;

            case "maxProtein":
                dispatch({ type: "maxProtein", details: value ?? 0 });
                break;

            default:
                break;
        }
    };

    const submitHandler = (event) => {
        event.preventDefault();

        const form = event.target;
        const { minKcal, maxKcal, minProtein, maxProtein, numDays } = form;

        if (!minKcal.value || !maxKcal.value || !minProtein.value || !maxProtein.value || !numDays.value) return;

        generateMealPlan([minKcal.value, maxKcal.value], [minProtein.value, maxProtein.value], numDays.value);
    };

    const generateMealPlan = async (range1, range2, n) => {
        // check if any meals have been locked in place
        let lockedMeals = mealPlan
            .map((day, dayIndex) => {
                return day.map((meal) => {
                    if (meal.is_locked) {
                        return [dayIndex, day.indexOf(meal), meal];
                    }
                });
            })
            .flat()
            .filter((meal) => meal !== undefined);

        const numbers = recipes.map((recipe) => ({
            id: recipe.id,
            display_name: recipe.display_name,
            kcal: recipe.total_kcal,
            protein: recipe.total_protein,
        }));

        const combination = getRandomCombinations(numbers, range1, range2, n);

        if (combination) {
            // const newArr = [...mealPlan];
            // newArr[index];

            setMealPlan(combination);
        }
    };

    const updateMealPlan = async (index, range1, range2, n) => {
        // check if any meals have been locked in place
        let lockedMeals = mealPlan
            .map((day, dayIndex) => {
                return day.map((meal) => {
                    if (meal.is_locked) {
                        return [dayIndex, day.indexOf(meal), meal];
                    }
                });
            })
            .flat()
            .filter((meal) => meal !== undefined);

        const numbers = recipes.map((recipe) => ({
            id: recipe.id,
            display_name: recipe.display_name,
            kcal: recipe.total_kcal,
            protein: recipe.total_protein,
        }));

        const newCombination = getRandomCombinations(numbers, range1, range2, n);

        if (newCombination) {
            const newArr = [...mealPlan];
            newArr[index] = newCombination[0]; // Update the specific day with the new combination

            setMealPlan(newArr);
        }
    };

    const geLockedMeals = () => {
        const lockedMeals = mealPlan.reduce((acc, day, dayIndex) => {
            day.forEach((meal, mealIndex) => {
                if (meal.is_locked) {
                    acc.push({ dayIndex, mealIndex });
                }
            });

            return acc;
        }, []);

        return lockedMeals;
    };

    const lockMeal = (dayIndex, mealIndex) => {
        const isLocked = mealPlan[dayIndex][mealIndex].is_locked ? false : true;
        const newMealPlan = [...mealPlan];
        newMealPlan[dayIndex][mealIndex].is_locked = isLocked;
        setMealPlan(newMealPlan);
    };

    return (
        <Stack>
            <PrimaryHeading>Meal Planner</PrimaryHeading>

            <form onSubmit={submitHandler}>
                <Stack space="var(--size-2)">
                    <Switcher threshold="280px" space="var(--size-1)" limit="2">
                        <Input
                            id="minKcal"
                            label="Minimum kcal"
                            type="number"
                            step={1}
                            value={state.minKcal}
                            changeHandler={changeHandler}
                        />
                        <Input
                            id="maxKcal"
                            label="Maximum kcal"
                            type="number"
                            step={1}
                            value={state.maxKcal}
                            changeHandler={changeHandler}
                        />
                    </Switcher>
                    <Switcher threshold="280px" space="var(--size-1)" limit="3">
                        <Input
                            id="minProtein"
                            label="Minimum protein"
                            type="number"
                            step={1}
                            value={state.minProtein}
                            changeHandler={changeHandler}
                        />
                        <Input
                            id="maxProtein"
                            label="Maximum protein"
                            type="number"
                            step={1}
                            value={state.maxProtein}
                            changeHandler={changeHandler}
                        />
                    </Switcher>
                    <Input
                        id="numDays"
                        label="Number of days"
                        type="number"
                        min={1}
                        max={14}
                        step={1}
                        defaultValue={7}
                    />
                    <Button variant="primary" fullWidth type="submit">
                        Generate meal plan
                    </Button>
                </Stack>
            </form>

            <MealPlan
                mealPlan={mealPlan}
                updateMealPlan={updateMealPlan}
                lockMeal={lockMeal}
                minKcal={state.minKcal}
                maxKcal={state.maxKcal}
                minProtein={state.minProtein}
                maxProtein={state.maxProtein}
            />

            {mealPlan.length > 1 && <ShoppingList mealPlan={mealPlan} />}
        </Stack>
    );
};

export default MealPlanner;
