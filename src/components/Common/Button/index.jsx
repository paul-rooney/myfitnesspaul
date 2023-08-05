import styles from "./button.module.css";

// TODO: Add loading state for buttons

const Button = ({ variant, fullWidth, type = "button", clickHandler, children, ...attributes }) => (
    <button {...attributes} className={`${styles.button} ${attributes.className ? attributes.className : ""}`.trim()} data-variant={variant} data-full-width={fullWidth} type={type} onClick={clickHandler}>
        {children}
    </button>
);

export default Button;