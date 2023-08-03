import styles from "./button.module.css";

const Button = ({ variant = "default", type = "button", clickHandler, children, ...attributes }) => {
    return (
        <button {...attributes} className={`${styles.button} ${attributes.className ? attributes.className : ""}`.trim()} data-variant={variant} type={type} onClick={clickHandler}>
            {children}
        </button>
    );
};

export default Button;
