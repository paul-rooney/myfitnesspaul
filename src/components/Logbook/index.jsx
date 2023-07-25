import { useState } from "react";
import { Cluster, Icon, Grid, Stack, Switcher } from "../../primitives";
import { supabase } from "../../supabase";
import { formatDate, groupBy, shuffleArray } from "../../utilities";
import styles from "./logbook.module.scss";

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

const readRows = async (table, columns = "*", arr) => {
    try {
        const { data, error } = await supabase.from(table).select(columns).in("recipe_id", arr);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    } catch (error) {
        console.error("An error occurred: ", error);
    }
};

const Logbook = ({ recipes }) => {
    const [mealPlan, setMealPlan] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);

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

        readRows("recipes_ingredients", `id, recipe_id, quantity, unit, ingredients (id, display_name)`, arr).then(
            (ingredients) => {
                const groupedMealsWithIngredients = mealPlan
                    .flat()
                    .map((meal) =>
                        ingredients
                            .filter((item) => meal.id === item.recipe_id)
                            .map((item) => ({
                                ...meal,
                                ingredient_id: item.ingredients.id,
                                ingredient_display_name: item.ingredients.display_name,
                                quantity: item.quantity,
                                unit: item.unit,
                            }))
                    )
                    .flat();

                setShoppingList(Object.entries(groupBy(groupedMealsWithIngredients, "ingredient_display_name")));
            }
        );
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

    return (
        <>
            <h2 className={styles.heading}>Log</h2>
            <time>{formatDate(new Date(), "en-GB")}</time>

            <details>
                <summary>
                    <h3>Mealplaninator</h3>
                </summary>
                <form onSubmit={submitHandler}>
                    <Stack space="var(--size-2)">
                        <Switcher threshold="280px" space="var(--size-1)" limit="2">
                            <Stack space="var(--size-1)">
                                <label className={styles.label}>Minimum kcal</label>
                                <input
                                    id="minKcal"
                                    className={styles.input}
                                    type="number"
                                    step={10}
                                    defaultValue={1400}
                                ></input>
                            </Stack>
                            <Stack space="var(--size-1)">
                                <label className={styles.label}>Maximum kcal</label>
                                <input
                                    id="maxKcal"
                                    className={styles.input}
                                    type="number"
                                    step={10}
                                    defaultValue={1550}
                                ></input>
                            </Stack>
                        </Switcher>
                        <Switcher threshold="280px" space="var(--size-1)" limit="3">
                            <Stack space="var(--size-1)">
                                <label className={styles.label}>Minimum protein</label>
                                <input
                                    id="minProtein"
                                    className={styles.input}
                                    type="number"
                                    step={1}
                                    defaultValue={120}
                                ></input>
                            </Stack>
                            <Stack space="var(--size-1)">
                                <label className={styles.label}>Maximum protein</label>
                                <input
                                    id="maxProtein"
                                    className={styles.input}
                                    type="number"
                                    step={1}
                                    defaultValue={160}
                                ></input>
                            </Stack>
                        </Switcher>
                        <Stack space="var(--size-1)">
                            <label className={styles.label}>Number of days</label>
                            <input
                                id="numDays"
                                className={styles.input}
                                type="number"
                                min={1}
                                max={14}
                                step={1}
                                defaultValue={7}
                            ></input>
                        </Stack>
                        <button type="submit" className={styles.addButton}>
                            <Icon space=".5ch" direction="ltr" icon="plus">
                                Generate meal plan
                            </Icon>
                        </button>
                    </Stack>
                </form>
                <Grid min="150px">
                    {mealPlan.length > 0
                        ? mealPlan.map((day, dayIndex) => (
                              <div style={{ fontSize: "var(--font-size-0)" }} key={`${day}-${dayIndex}`}>
                                  <Stack key={dayIndex} space="var(--size-2)">
                                      <Cluster justify="space-between" align="baseline">
                                          <h3>Day {dayIndex + 1}</h3>
                                          <button
                                              className={styles.addButton}
                                              onClick={() => updateMealPlan(dayIndex, [1400, 1550], [120, 160], 1)}
                                          >
                                              <Icon space=".5ch" direction="ltr" icon="refresh-cw" />
                                          </button>
                                      </Cluster>
                                      {day.map((meal, mealIndex) => (
                                          <button
                                              key={`${meal.id}-${dayIndex}`}
                                              type="button"
                                              onClick={() => lockMeal(dayIndex, mealIndex)}
                                              style={meal?.is_locked ? { backgroundColor: "blue" } : {}}
                                          >
                                              <Stack space="var(--size-1)">
                                                  <span style={{ color: "var(--blue-10)", fontWeight: "600" }}>
                                                      {meal.display_name}
                                                  </span>
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
            </details>
            <details>
                <summary>
                    <h3>Shopping list</h3>
                </summary>
                <button onClick={generateShoppingList}>Generate shopping list</button>
                <Grid space="var(--size-2)">
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
                                      <div style={{ fontSize: "var(--font-size-0)" }} key={value.id}>
                                          <Cluster space="var(--size-3)">
                                              <span>{value[0].ingredient_display_name}</span>
                                              <span key={value.id}>
                                                  Total:{" "}
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

                                                      return acc + q;
                                                  }, 0)}
                                              </span>
                                          </Cluster>
                                      </div>
                                  );
                              })
                        : null}
                </Grid>
            </details>

            <form onSubmit={submitHandler} hidden>
                <Stack>
                    <Stack space="var(--size-1)">
                        <label className={styles.label} htmlFor="weight">
                            Weight
                        </label>
                        <input id="weight" type="number" />
                    </Stack>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Breakfast</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label htmlFor="breakfast"></label>
                            <input id="breakfast" /> */}
                        </Stack>
                    </fieldset>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Lunch</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label htmlFor="lunch"></label>
                            <input id="lunch" /> */}
                        </Stack>
                    </fieldset>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Dinner</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label htmlFor="dinner"></label>
                            <input id="dinner" /> */}
                        </Stack>
                    </fieldset>
                </Stack>
            </form>
        </>
    );
};

export default Logbook;
