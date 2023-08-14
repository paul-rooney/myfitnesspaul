import { useEffect, useReducer, useState } from "react";
import { Stack, Switcher } from "../../primitives";
import { readRows } from "../../supabase";
import { shuffleArray } from "../../utilities";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import Input from "../Common/Input";
import MealPlan from "./MealPlan";
import ShoppingList from "./ShoppingList";
import MealPlanOutline from "./MealPlanOutline";

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

const getWeight = async () => {
    const getMeanWeight = (arr) => arr.reduce((acc, value) => acc + value, 0) / arr.length;

    const weightData = await readRows("users_weight");
    // const { weight } = weightData.pop();
    const weight = weightData.slice(-7).map((value) => value.weight);
    const meanWeight = getMeanWeight(weight);

    return meanWeight;
};

const reducer = (state, action) => ({ ...state, [action.type]: action.details });

const MealPlanner = ({ recipes }) => {
    const [weight, setWeight] = useState(null);
    const [mealPlan, setMealPlan] = useState([]);
    const [mealPlanOutline, setMealPlanOutline] = useState([]);
    const [state, dispatch] = useReducer(reducer, {
        minKcal: 1450,
        maxKcal: 1550,
        minProtein: 105,
        maxProtein: 165,
        numDays: 7,
    });

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

            case "numDays":
                dispatch({ type: "numDays", details: value ?? 0 });
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
        let lockedMeals = getLockedMeals();

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

    const getLockedMeals = () => {
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
        // Create a copy rather than creating a reference to nested objects
        // that occurs when using the spread operator
        const newMealPlan = JSON.parse(JSON.stringify(mealPlan));
        newMealPlan[dayIndex][mealIndex].is_locked = isLocked;
        setMealPlan(newMealPlan);
    };

    function replaceMealsExceptLocked(mealPlan) {
        const newArray = mealPlan.map((mealsArray) => {
            const preservedMealIndex = mealsArray.findIndex((meal) => meal.is_locked);

            return mealsArray.map((meal, index) => {
                if (index === preservedMealIndex || meal.is_locked) {
                    // Preserve the meal with is_locked set to true
                    return meal;
                } else {
                    // Replace all other meals with new data
                    return {
                        id: crypto.randomUUID(),
                        protein: Math.floor(Math.random() * 10 + 1),
                        kcal: Math.floor(Math.random() * 10) + 1,
                        display_name: `NewMeal${index}`,
                    };
                }
            });
        });

        console.log(newArray);
        setMealPlan(newArray);
        return newArray;
    }

    // Sample array of arrays of meals
    // const mealPlan = [
    //     [
    //         { kcal: 596, display_name: "Sweet potato with chipotle butter chicken", is_locked: true }, // Preserve this meal
    //         { kcal: 491, display_name: "Egg and mango chutney flatbreads" },
    //         { kcal: 378, display_name: "Mango and passionfruit smoothie" },
    //     ],
    //     [
    //         { kcal: 351, display_name: "Blueberry smoothie", is_locked: true }, // Preserve this meal
    //         { kcal: 378, display_name: "One-pot chicken cordon bleu pasta" },
    //         { kcal: 356, display_name: "Fats-me-up smoothie" },
    //     ],
    //     // Add more arrays of meals here as needed
    // ];

    //   const result = replaceMealsExceptLocked(mealPlan);
    //   console.log(result);

    const buildMealPlanOutline = () => {
        const days = [];

        for (let i = 0; i < state.numDays; i++) {
            days.push([]);
        }

        setMealPlanOutline(days);
    };

    return (
        <Stack>
            <PrimaryHeading>Meal Planner</PrimaryHeading>

            {/* <p>{JSON.stringify(mealPlan)}</p> */}
            <Button clickHandler={() => replaceMealsExceptLocked(mealPlan)}>Fruit machine</Button>

            <form onSubmit={submitHandler}>
                <Stack space="var(--size-3)">
                    <Switcher threshold="280px" space="var(--size-2)" limit="2">
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
                    <Switcher threshold="280px" space="var(--size-2)" limit="3">
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
                        value={state.numDays}
                        changeHandler={changeHandler}
                    />
                    <Button variant="primary" fullWidth type="submit">
                        Generate meal plan
                    </Button>
                    <Button variant="secondary" fullWidth clickHandler={buildMealPlanOutline}>
                        I want to choose
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
            <MealPlanOutline mealPlanOutline={mealPlanOutline} />

            {mealPlan.length > 1 && <ShoppingList mealPlan={mealPlan} />}
        </Stack>
    );
};

export default MealPlanner;
