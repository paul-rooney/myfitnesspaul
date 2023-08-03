import { useEffect, useMemo } from "react";
import { debounce } from "../../utilities";
import styles from "./ingredient-list.module.scss";

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

    return (
        <fieldset className={styles.fieldset}>
            <label className={styles.label} htmlFor="search">
                Search ingredients
            </label>
            <input className={styles.searchInput} id="search" type="search" onChange={changeHandler} />
        </fieldset>
    );
};

export default FilterIngredientsForm;
