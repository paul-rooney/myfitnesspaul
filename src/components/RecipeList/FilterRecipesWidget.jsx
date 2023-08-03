import { useMemo, useState } from "react";
import { Stack } from "../../primitives";
import { supabase } from "../../supabase";
import { debounce, groupBy } from "../../utilities";
import styles from "./recipe-list.module.scss";
import Input from "../Common/Input";

const FilterRecipesWidget = ({ recipes, setFilteredRecipes }) => {
    const [caloriesFilterDisplayValue, setCaloriesFilterDisplayValue] = useState(500);

    const changeHandler = useMemo(() => {
        const getStuff = async (str) => {
            const { data, error } = await supabase.from("recipes_ingredients").select().ilike("ingredient_identifier", `%${str}%`);
            return data ?? error;
        };

        const storedRecipes = recipes;

        return debounce(async (event) => {
            const { id, value } = event.target;

            if (value.length < 3) {
                setFilteredRecipes(recipes);
                return;
            }
            let x = await getStuff(value).then((data) => data.map((item) => item.recipe_id));
            let y = recipes.flat().filter((recipe) => x.includes(recipe.id));
            const groupedData = Object.values(groupBy(y, "id"));

            setFilteredRecipes(groupedData);
        }, 250);
    }, [recipes]);

    return (
        <Stack space="var(--size-3)">
            <Stack space="var(--size-1)">
                <Input id="ingredients_filter" label="Find recipes with&hellip;" changeHandler={changeHandler} />
            </Stack>
            {/* <div className={styles.caloriesFilter}>
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
                </div> */}
        </Stack>
    );
};

export default FilterRecipesWidget;
