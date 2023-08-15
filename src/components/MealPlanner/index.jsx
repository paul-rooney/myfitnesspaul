import { useEffect, useReducer, useState } from "react";
import { Stack, Switcher } from "../../primitives";
import { readRows } from "../../supabase";
import { shuffleArray } from "../../utilities";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import Input from "../Common/Input";
import MealPlan from "./MealPlan";
import ShoppingList from "./ShoppingList";

// This function generates random combinations of objects based on certain criteria.
// The goal is to create combinations that satisfy calorie and protein ranges for a given number of days.
function getRandomCombinations(objects, kcalRange, proteinRange, numDays) {
    // Shuffle the input array of objects to introduce randomness.
    const shuffledObjects = shuffleArray(objects);

    // Initialize arrays and a set to store combinations and track unique combinations.
    const combinations = [];
    const uniqueCombinations = new Set();

    // Use a stack-based approach to generate combinations iteratively.
    const stack = [{ arr: [], kcalSum: 0, proteinSum: 0, index: 0 }];

    // Continue processing as long as there are items in the stack and unique combinations are not enough.
    while (stack.length > 0 && uniqueCombinations.size < numDays) {
        // Pop the top item from the stack.
        const { arr, kcalSum, proteinSum, index } = stack.pop();
        const currentObject = shuffledObjects[index];

        // Calculate the sum of calories and protein with the current object.
        const newKcalSum = kcalSum + currentObject.kcal;
        const newProteinSum = proteinSum + currentObject.protein;

        // Check if the new combination satisfies the calorie and protein ranges.
        if (
            newKcalSum >= kcalRange[0] &&
            newKcalSum <= kcalRange[1] &&
            newProteinSum >= proteinRange[0] &&
            newProteinSum <= proteinRange[1]
        ) {
            // Create a new combination array and stringify it.
            const combination = [...arr, currentObject];
            const combinationString = JSON.stringify(combination);

            // Add the combination to the set if it's unique, and store it in the array.
            if (!uniqueCombinations.has(combinationString)) {
                uniqueCombinations.add(combinationString);
                combinations.push(combination);
            }
        }

        // If calorie or protein limits are exceeded, or all objects are processed, move on.
        if (newKcalSum > kcalRange[1] || newProteinSum > proteinRange[1] || index >= shuffledObjects.length - 1) {
            continue;
        }

        // Push two new items to the stack: one with the current object included and one without.
        stack.push({
            arr: [...arr, currentObject],
            kcalSum: newKcalSum,
            proteinSum: newProteinSum,
            index: index + 1,
        });
        stack.push({ arr, kcalSum, proteinSum, index: index + 1 });
    }

    // Return a slice of the combinations array to match the desired number of days.
    return combinations.slice(0, numDays);
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

const MealPlanner = ({ recipes, showToast }) => {
    const [weight, setWeight] = useState(null);
    const [mealPlan, setMealPlan] = useState([]);
    const [isManualSelection, setIsManualSelection] = useState(false);
    const [state, dispatch] = useReducer(reducer, {
        minKcal: 1450,
        maxKcal: 1550,
        minProtein: 120,
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

    const generateMealPlan = async (kcalRange, proteinRange, numDays, dayIndex) => {
        setIsManualSelection(false);
        let lockedMeals = getLockedMeals();

        const reducedRecipes = recipes.map((recipe) => ({
            id: recipe.id,
            display_name: recipe.display_name,
            kcal: recipe.total_kcal,
            protein: recipe.total_protein,
        }));

        const combination = getRandomCombinations(reducedRecipes, kcalRange, proteinRange, numDays);

        if (combination) {
            if (dayIndex >= 0) {
                const newArr = [...mealPlan];
                newArr[dayIndex] = combination[0];

                setMealPlan(newArr);
            } else {
                setMealPlan(combination);
            }
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
        setIsManualSelection(true);

        if (mealPlan.length < 1) {
            const days = [];

            for (let i = 0; i < state.numDays; i++) {
                days.push([]);
            }

            setMealPlan(days);
        }
    };

    return (
        <Stack>
            <PrimaryHeading>Meal Planner</PrimaryHeading>

            {/* <Button clickHandler={() => replaceMealsExceptLocked(mealPlan)}>Fruit machine</Button> */}

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
                    <Switcher threshold="280px" space="var(--size-2)">
                        <Button variant="primary" fullWidth type="submit">
                            Generate meal plan
                        </Button>
                        <Button variant="secondary" fullWidth clickHandler={buildMealPlanOutline}>
                            I want to choose
                        </Button>
                    </Switcher>
                </Stack>
            </form>

            <MealPlan
                mealPlan={mealPlan}
                setMealPlan={setMealPlan}
                updateMealPlan={generateMealPlan}
                lockMeal={lockMeal}
                minKcal={state.minKcal}
                maxKcal={state.maxKcal}
                minProtein={state.minProtein}
                maxProtein={state.maxProtein}
                recipes={recipes}
                isManualSelection={isManualSelection}
            />

            {mealPlan.length > 1 && <ShoppingList mealPlan={mealPlan} showToast={showToast} />}
        </Stack>
    );
};

export default MealPlanner;
