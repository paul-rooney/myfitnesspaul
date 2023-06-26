import { useMemo, useState } from "react";
import { Stack } from "../../primitives";
import { supabase } from "../../supabase";
import { debounce } from "../../utilities";
import styles from "./recipe-list.module.scss";

const FilterRecipesWidget = ({ recipes }) => {
    const [caloriesFilterDisplayValue, setCaloriesFilterDisplayValue] = useState(500);

    const changeHandler = useMemo(() => {
        const getStuff = async (str) => {
            const { data, error } = await supabase.from("recipes_ingredients").select().ilike("ingredient_identifier", `%${str}%`);
            return data ?? error;
        };
        const storedRecipes = recipes;
        return debounce(async (event) => {
            const { id, value } = event.target;
            switch (id) {
                case "ingredients_filter":
                    if (value.length < 3) {
                        setFilteredRecipes(recipes);
                        return;
                    }
                    let x = await getStuff(value).then((data) => data.map((item) => item.recipe_id));
                    let y = recipes.flat().filter((recipe) => x.includes(recipe.id));
                    const groupedData = Object.values(groupBy(y, "id"));
                    // console.log(groupedData);
                    setFilteredRecipes(groupedData);
                    break;
                case "calories_filter":
                    let grouped = Object.values(groupBy(recipes.flat(), "id"));
                    let c = grouped.map((item) => {
                        let total_kcal = item.reduce((acc, item) => item.kcal + acc, 0);
                        item.total_kcal = total_kcal;
                        return item;
                    });
                    setCaloriesFilterDisplayValue(value);
                    setFilteredRecipes(c.filter((item) => item.total_kcal <= value));
                    break;
                default:
                    break;
            }
        }, 250);
    }, [recipes]);

    return (
        <fieldset>
            <Stack space="var(--size-3)">
                <Stack space="var(--size-1)">
                    <label>Find recipes with&hellip;</label>
                    <input
                        id="ingredients_filter"
                        onChange={changeHandler}
                    />
                </Stack>
                <div className={styles.caloriesFilter}>
                    <label className={styles.label}>With calories under&hellip;</label>
                    <input
                        className={styles.range}
                        id="calories_filter"
                        type="range"
                        list="markers"
                        min={200}
                        max={1200}
                        step={50}
                        defaultValue={caloriesFilterDisplayValue}
                        onChange={changeHandler}
                        onInput={setCaloriesFilterDisplayValue}
                    />
                    <output htmlFor="calories_filter">200</output>
                    <datalist id="markers">
                        <option value="200"></option>
                        <option value="400"></option>
                        <option value="600"></option>
                        <option value="800"></option>
                        <option value="1000"></option>
                        <option value="1200"></option>
                    </datalist>
                </div>
            </Stack>
        </fieldset>
    );
};

export default FilterRecipesWidget;
