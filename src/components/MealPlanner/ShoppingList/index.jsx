import { useState } from "react";
import { Cluster, Stack } from "../../../primitives";
import Button from "../../Common/Button";
import { groupBy, sortAlphabetical } from "../../../utilities";
import { supabase } from "../../../supabase";

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

const ShoppingList = ({ mealPlan }) => {
    const [shoppingList, setShoppingList] = useState([]);

    const generateShoppingList = () => {
        let arr = mealPlan.flat().map((item) => item.id);

        readRows("recipes", `servings, recipes_ingredients (id, recipe_id, quantity, unit, ingredients (id, display_name))`, arr).then((ingredients) => {
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
                            servings: item.servings,
                        }))
                )
                .flat();

            setShoppingList(Object.entries(groupBy(groupedMealsWithIngredients, "ingredient_display_name")));
        });
    };

    return (
        <>
            <Button fullWidth clickHandler={generateShoppingList}>
                Generate shopping list
            </Button>
            <Stack space="var(--size-2)" role="list">
                {shoppingList.length > 0
                    ? shoppingList
                          .sort((a, b) => sortAlphabetical(a, b, 0))
                          .map(([, value], index) => {
                              return (
                                  <Cluster justify="space-between" space="var(--size-3)" style={{ fontSize: "var(--font-size-0)" }} role="listitem" key={index}>
                                      <span>{value[0].ingredient_display_name}</span>
                                      <span>{value.id}</span>
                                      <span>
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

                                              return parseFloat(((acc + q) / item.servings).toFixed(2));
                                          }, 0)}
                                          {value.map((item) => item.unit).every((currentValue) => ["g", "ml", "tsp", "tbsp"].includes(currentValue)) ? "g" : null}
                                      </span>
                                  </Cluster>
                              );
                          })
                    : null}
            </Stack>
        </>
    );
};

export default ShoppingList;
