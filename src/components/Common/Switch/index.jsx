import styles from "./switch.module.css";

const Switch = ({ id, label, changeHandler }) => {
    const getStyle = (element, property) => {
        return parseInt(window.getComputedStyle(element).getPropertyValue(property));
    };

    const getPseudoStyle = () => {
        return parseInt(window.getComputedStyle(element, "::before").getPropertyValue(property));
    };

    // const dragging = (event) => {
    //     if (!state.activethumb) return;

    //     let {} = switches
    // };

    return (
    <label htmlFor={id} className={styles.switch}>
        {label}
        <input id={id} data-switch type="checkbox" role="switch" onChange={changeHandler} />
    </label>
)};

export default Switch;
