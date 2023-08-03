import { useEffect, useState } from "react";
import { Cluster, Icon, Grid, Stack, Switcher } from "../../primitives";
import { supabase } from "../../supabase";
import { groupBy, shuffleArray } from "../../utilities";
import styles from "./meal-planner.module.scss";
import Button from "../Common/Button";
import PrimaryHeading from "../Common/PrimaryHeading";
import Input from "../Common/Input";
import SecondaryHeading from "../Common/SecondaryHeading";

function getRandomCombinations(objects, range1, range2, n) {
    // Shuffle the objects array
    const shuffledObjects = shuffleArray(objects);

    const combinations = [];
    const uniqueCombinations = new Set();
    const stack = [{ arr: [], kcalSum: 0, proteinSum: 0, index: 0 }];

    while (stack.length > 0 && uniqueCombinations.size < n) {
        const { arr, kcalSum, proteinSum, index } = stack.pop();
        const currentObject = shuffledObjects[index];

        const newKcalSum = kcalSum + currentObject.kcal;
        const newProteinSum = proteinSum + currentObject.protein;

        if (newKcalSum >= range1[0] && newKcalSum <= range1[1] && newProteinSum >= range2[0] && newProteinSum <= range2[1]) {
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

const readRows = async (table, columns = "*", arr) => {
    try {
        const { data, error } = await supabase.from(table).select(columns).in("id", arr);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

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

const MealPlanner = ({ recipes }) => {
    const [mealPlan, setMealPlan] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [weight, setWeight] = useState(null);

    useEffect(() => {
        if (weight) return;

        getWeight().then((weightValue) => setWeight(weightValue));
    }, [weight]);

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
        console.log(lockedMeals);

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
        console.log(lockedMeals);

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

    const generateShoppingList = () => {
        let arr = mealPlan.flat().map((item) => item.id);
        // console.log(arr);

        // readRows("recipes_ingredients", `id, recipe_id, quantity, unit, ingredients (id, display_name)`, arr).then(
        // (ingredients) => {
        // const groupedMealsWithIngredients = mealPlan
        //     .flat()
        //     .map((meal) =>
        //         ingredients
        //             .filter((item) => meal.id === item.recipe_id)
        //             .map((item) => ({
        //                 ...meal,
        //                 ingredient_id: item.ingredients.id,
        //                 ingredient_display_name: item.ingredients.display_name,
        //                 quantity: item.quantity,
        //                 unit: item.unit,
        //             }))
        //     )
        //     .flat();

        // setShoppingList(Object.entries(groupBy(groupedMealsWithIngredients, "ingredient_display_name")));
        //     }
        // );

        readRows(
            "recipes",
            `servings, recipes_ingredients (id, recipe_id, quantity, unit, ingredients (id, display_name))`,
            arr
        ).then((ingredients) => {
            let x = ingredients.flatMap((item) =>
                item.recipes_ingredients.map((ingredient) => {
                    ingredient.servings = item.servings;
                    return ingredient;
                })
            );
            const groupedMealsWithIngredients = mealPlan
                .flat()
                .map((meal) =>
                    x
                        .filter((item) => meal.id === item.recipe_id)
                        .map((item) => ({
                            ...meal,
                            ingredient_id: item.ingredients.id,
                            ingredient_display_name: item.ingredients.display_name,
                            quantity: item.quantity,
                            unit: item.unit,
                            servings: item.servings
                        }))
                )
                .flat();

            setShoppingList(Object.entries(groupBy(groupedMealsWithIngredients, "ingredient_display_name")));
        });
    };

    const lockMeal = (dayIndex, mealIndex) => {
        const isLocked = mealPlan[dayIndex][mealIndex].is_locked ? false : true;
        const newArr = [...mealPlan];

        const updatedDay = newArr[dayIndex].map((meal, index) => {
            if (index === mealIndex) {
                return {
                    ...meal,
                    is_locked: isLocked,
                };
            }
            return meal;
        });

        newArr[dayIndex] = updatedDay;
        setMealPlan(newArr);
    };

    // const bmr = mifflinStJeorEquation(weight, 175.26, 32);

    return (
        <Stack>
            <PrimaryHeading>Meal Planner</PrimaryHeading>

            <form onSubmit={submitHandler}>
                <Stack space="var(--size-2)">
                    <Switcher threshold="280px" space="var(--size-1)" limit="2">
                        <Input id="minKcal" label="Minimum kcal" type="number" step={10} defaultValue={1450} />
                        <Input id="maxKcal" label="Maximum kcal" type="number" step={10} defaultValue={1550} />
                    </Switcher>
                    <Switcher threshold="280px" space="var(--size-1)" limit="3">
                        <Input id="minProtein" label="Minimum protein" type="number" step={1} defaultValue={weight && Math.round(weight * 0.7)} />
                        <Input id="maxProtein" label="Maximum protein" type="number" step={1} defaultValue={weight && Math.round(weight * 1.1)} />
                    </Switcher>
                    <Stack space="var(--size-1)">
                        <Input id="numDays" label="Number of days" type="number" min={1} max={14} step={1} defaultValue={7} />
                    </Stack>
                    <Button variant="primary" fullWidth type="submit">
                        <Icon space=".5ch" direction="ltr" icon="plus">
                            Generate meal plan
                        </Icon>
                    </Button>
                </Stack>
            </form>
            <Grid min="150px">
                {mealPlan.length > 0
                    ? mealPlan.map((day, dayIndex) => (
                          <div style={{ fontSize: "var(--font-size-0)" }} key={`${day}-${dayIndex}`}>
                              <Stack key={dayIndex} space="var(--size-2)">
                                  <Cluster justify="space-between" align="baseline">
                                      <h3>Day {dayIndex + 1}</h3>
                                      <Button clickHandler={() => updateMealPlan(dayIndex, [1400, 1550], [120, 160], 1)}>
                                          <Icon direction="ltr" icon="refresh-cw" />
                                      </Button>
                                  </Cluster>
                                  {day.map((meal, mealIndex) => (
                                      <button key={`${meal.id}-${dayIndex}`} type="button" onClick={() => lockMeal(dayIndex, mealIndex)} style={meal?.is_locked ? { backgroundColor: "blue" } : {}}>
                                          <Stack space="var(--size-1)">
                                              <span style={{ color: "var(--blue-10)", fontWeight: "600" }}>{meal.display_name}</span>
                                              <Cluster>
                                                  <span>kcal: {meal.kcal}</span>

                                                  <span>Protein: {meal.protein}</span>
                                              </Cluster>
                                          </Stack>
                                      </button>
                                  ))}
                                  <Cluster>
                                      <Stack>
                                          <span>Total kcal:</span>
                                          {day.reduce((acc, meal) => meal.kcal + acc, 0)}
                                      </Stack>
                                      <Stack>
                                          <span>Total protein:</span>
                                          {day.reduce((acc, meal) => meal.protein + acc, 0)}
                                      </Stack>
                                  </Cluster>
                              </Stack>
                          </div>
                      ))
                    : null}
            </Grid>
            <details className={styles.details} open>
                <summary>
                    <SecondaryHeading>Shopping List</SecondaryHeading>
                </summary>
                <Stack>
                    <Button fullWidth clickHandler={generateShoppingList}>
                        Generate shopping list
                    </Button>
                    <Stack space="var(--size-2)">
                        {shoppingList.length > 1
                            ? shoppingList
                                  .sort((a, b) =>
                                      new Intl.Collator(undefined, {
                                          sensitivity: "base",
                                          ignorePunctuation: true,
                                      }).compare(a[0], b[0])
                                  )
                                  .map(([, value]) => {
                                      return (
                                          <Cluster justify="space-between" space="var(--size-3)" style={{ fontSize: "var(--font-size-0)" }} key={value.id}>
                                              <span>{value[0].ingredient_display_name}</span>
                                              <span key={value.id}>
                                                  {value.reduce((acc, item) => {
                                                      let q;

                                                      switch (item.unit) {
                                                          case "tsp":
                                                              q = item.quantity * 5;
                                                              break;
                                                          case "tbsp":
                                                              q = item.quantity * 15;
                                                              break;
                                                          case "pint":
                                                              q = item.quantity * 568;
                                                              break;
                                                          case "g":
                                                          case "ml":
                                                          default:
                                                              q = item.quantity;
                                                              break;
                                                      }

                                                      return (acc + q) / item.servings;
                                                  }, 0)}
                                                  {value.map((item) => item.unit).every((currentValue) => ["g", "ml", "tsp", "tbsp"].includes(currentValue)) ? "g" : null}
                                              </span>
                                          </Cluster>
                                      );
                                  })
                            : null}
                    </Stack>
                </Stack>
            </details>
        </Stack>
    );
};

export default MealPlanner;
