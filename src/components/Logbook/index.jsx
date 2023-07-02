import { Fragment, useEffect, useState } from "react";
import { Cluster, Icon, Grid, Stack } from "../../primitives";
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

    useEffect(() => {
        if (!mealPlan) return;

        let arr = mealPlan.flat().map((item) => item.id);

        readRows("recipes_ingredients", `quantity, unit, ingredients (id, display_name)`, arr).then((ingredients) => {
            // let x = groupBy(ingredients, "ingredients.id");
            let x = ingredients.map((item) => ({
                id: item.ingredients.id,
                display_name: item.ingredients.display_name,
                quantity: item.quantity,
                unit: item.unit,
            }));
            let y = Object.entries(groupBy(x, "id"));
            console.log(y);
            setShoppingList(y);
        });
    }, [mealPlan]);

    const submitHandler = (event) => {
        event.preventDefault();

        const form = event.target;
        console.log(form);
    };

    const generateMealPlan = async (range1, range2, n) => {
        const numbers = recipes.map((recipe) => ({
            id: recipe.id,
            display_name: recipe.display_name,
            kcal: recipe.total_kcal,
            protein: recipe.total_protein,
        }));

        const combination = getRandomCombinations(numbers, range1, range2, n);

        if (combination) {
            setMealPlan(combination);
        } else {
            console.log("Nothing returned");
        }
    };

    const updateMealPlan = async (index, range1, range2, n) => {
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

    return (
        <>
            <h2 className={styles.heading}>Log</h2>
            <time>{formatDate(new Date(), "en-GB")}</time>

            <button
                className={styles.addButton}
                data-operation="create"
                onClick={() => generateMealPlan([1400, 1550], [120, 160], 7)}
            >
                <Icon space=".5ch" direction="ltr" icon="plus">
                    Generate meal plan
                </Icon>
            </button>

            <Grid min="150px">
                {mealPlan.length > 0
                    ? mealPlan.map((day, index) => (
                          <div style={{ fontSize: "var(--font-size-0)" }} key={`${day}-${index}`}>
                              <Stack key={index} space="var(--size-2)">
                                  <Cluster justify="space-between" align="baseline">
                                      <h3>Day {index + 1}</h3>
                                      <button
                                          className={styles.addButton}
                                          onClick={() => updateMealPlan(index, [1400, 1550], [120, 160], 1)}
                                      >
                                          <Icon space=".5ch" direction="ltr" icon="refresh-cw" />
                                      </button>
                                  </Cluster>
                                  {day.map((meal) => (
                                      <Fragment key={`${meal.id}-${index}`}>
                                          <Stack space="var(--size-1)">
                                              <span style={{ color: "var(--jungle-10)", fontWeight: "600" }}>
                                                  {meal.display_name}
                                              </span>
                                              <Cluster>
                                                  <span>kcal: {meal.kcal}</span>

                                                  <span>Protein: {meal.protein}</span>
                                              </Cluster>
                                          </Stack>
                                      </Fragment>
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

            <Grid space="var(--size-2)">
                {shoppingList.length > 1
                    ? shoppingList.map(([key, value]) => {
                          return (
                              <div style={{ fontSize: "var(--font-size-0)" }} key={value.id}>
                                  <Cluster space="var(--size-3)">
                                      <span>{value[0].display_name}</span>
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

            <form onSubmit={submitHandler}>
                <Stack>
                    <Stack space="var(--size-1)">
                        <label html="weight">Weight</label>
                        <input id="weight" type="number" />
                    </Stack>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Breakfast</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label html="breakfast"></label>
                            <input id="breakfast" /> */}
                        </Stack>
                    </fieldset>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Lunch</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label html="lunch"></label>
                            <input id="lunch" /> */}
                        </Stack>
                    </fieldset>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Dinner</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label html="dinner"></label>
                            <input id="dinner" /> */}
                        </Stack>
                    </fieldset>
                </Stack>
            </form>
        </>
    );
};

export default Logbook;
