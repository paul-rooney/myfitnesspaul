import { useEffect, useMemo } from "react";
import { debounce } from "../../utilities";
import Input from "../Common/Input";

const FilterIngredientsForm = ({ ingredients, setFilteredIngredients }) => {
    useEffect(() => {
        setFilteredIngredients(ingredients);
    }, [ingredients]);

    const changeHandler = useMemo(() => {
        return debounce((event) => {
            const { value } = event.target;

            setFilteredIngredients(ingredients.filter(({ identifier, display_name }) => (identifier ? identifier.includes(value.toLowerCase().trim()) || display_name.toLowerCase().includes(value.toLowerCase().trim()) : null)));
        }, 250);
    }, [ingredients]);

    return <Input id="search" label="Search ingredients&hellip;" type="search" changeHandler={changeHandler} />;
};

export default FilterIngredientsForm;
