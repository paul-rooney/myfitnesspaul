import { Icon } from "../../../primitives";
import styles from "./button.module.css";

const Button = ({ variant, fullWidth, isLoading = false, type = "button", clickHandler, children, ...attributes }) => (
    <button {...attributes} className={`${styles.button} ${attributes.className ? attributes.className : ""}`.trim()} disabled={isLoading} data-loading={isLoading} data-variant={variant} data-full-width={fullWidth} type={type} onClick={clickHandler}>
        {isLoading ? <Icon label="Loading" icon="loader" /> : children}
    </button>
);

export default Button;
