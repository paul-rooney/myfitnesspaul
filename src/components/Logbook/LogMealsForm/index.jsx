import { Cluster, Icon, Stack } from "../../../primitives";
import { supabase, upsertRows } from "../../../supabase";
import Button from "../../Common/Button";
import Input from "../../Common/Input";

const LogMealsForm = ({ date, ingredients, recipes, state, dispatch }) => {
    const clickHandler = async (event) => {
        const { data } = await supabase.auth.getSession();
        const { meal } = event.target.closest("button").dataset;
        const input = document.getElementById(meal);
        const entry = {
            user_id: data.session.user.id,
            meal_name: null,
            meal_date: date,
            recipe_id: input.value,
        };

        switch (meal) {
            case "breakfast":
                entry.meal_name = "breakfast";
                dispatch({ type: "breakfast", details: entry });
                break;

            case "lunch":
                entry.meal_name = "lunch";
                dispatch({ type: "lunch", details: entry });
                break;

            case "dinner":
                entry.meal_name = "dinner";
                dispatch({ type: "dinner", details: entry });
                break;

            case "snacks":
                entry.meal_name = "snacks";
                dispatch({ type: "snacks", details: entry });
                break;

            default:
                break;
        }

        input.value = "";
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        const { breakfast, lunch, dinner, snacks } = state;
        const meals = [breakfast, lunch, dinner, snacks];

        for (const meal of meals) {
            if (meal && Object.keys(meal).length) {
                const payload = {
                    id: meal?.id,
                    user_id: meal.user_id,
                    meal_name: meal.meal_name,
                    meal_date: date,
                    recipe_id: meal.recipe_id,
                };

                await upsertRows("users_logs", payload, { ignoreDuplicates: false, onConflict: "meal_name_date" });
            }
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <datalist id="recipes_ingredients_list">
                {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                        {recipe.display_name}
                    </option>
                ))}
                {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.display_name}
                    </option>
                ))}
            </datalist>
            <Stack>
                <Input id="breakfast" label="Breakfast" list="recipes_ingredients_list" placeholder={state.breakfast?.display_name} variant="fancy">
                    <Button variant="secondary" data-meal="breakfast" clickHandler={clickHandler}>
                        <Icon space="0.5ch" direction="ltr" icon="plus">
                            Add
                        </Icon>
                    </Button>
                </Input>
                <Input id="lunch" label="Lunch" list="recipes_ingredients_list" placeholder={state.lunch?.display_name} variant="fancy">
                    <Button variant="secondary" data-meal="lunch" clickHandler={clickHandler}>
                        <Icon space="0.5ch" direction="ltr" icon="plus">
                            Add
                        </Icon>
                    </Button>
                </Input>
                <Input id="dinner" label="Dinner" list="recipes_ingredients_list" placeholder={state.dinner?.display_name} variant="fancy">
                    <Button variant="secondary" data-meal="dinner" clickHandler={clickHandler}>
                        <Icon space="0.5ch" direction="ltr" icon="plus">
                            Add
                        </Icon>
                    </Button>
                </Input>
                <Input id="snacks" label="Snacks" list="recipes_ingredients_list" placeholder={state.snacks?.display_name} variant="fancy">
                    <Button variant="secondary" data-meal="snacks" clickHandler={clickHandler}>
                        <Icon space="0.5ch" direction="ltr" icon="plus">
                            Add
                        </Icon>
                    </Button>
                </Input>
                <Cluster justify="end">
                    <Button variant="primary" fullWidth type="submit">
                        <Icon space="1ch" direction="ltr" icon="check">
                            Complete log
                        </Icon>
                    </Button>
                </Cluster>
            </Stack>
        </form>
    );
};

export default LogMealsForm;
