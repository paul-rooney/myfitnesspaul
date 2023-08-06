import { useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import { debounce } from "../../utilities";
import Input from "../Common/Input";

const FilterRecipesWidget = ({ recipes, setFilteredRecipes }) => {
    useEffect(() => {
        if (!recipes) return;

        setFilteredRecipes(recipes);
    }, [recipes]);

    const changeHandler = useMemo(() => {
        const readRows = async (str) => {
            const { data, error } = await supabase
                .from("recipes_ingredients")
                .select(`recipes (id)`)
                .ilike("ingredient_identifier", `%${str}%`);
            return data ?? error;
        };

        return debounce(async (event) => {
            const { value } = event.target;

            if (value.length < 3) {
                setFilteredRecipes(recipes);
                return;
            }

            readRows(value).then((response) => {
                const recipeIDs = response.map((entry) => entry.recipes.id);
                const filtered = recipes.filter((recipe) => recipeIDs.includes(recipe.id));

                setFilteredRecipes(filtered);
            });
        }, 250);
    }, [recipes]);

    return <Input id="recipes_search" label="Find recipes with&hellip;" type="search" changeHandler={changeHandler} />;
};

export default FilterRecipesWidget;
