import { Stack } from "../../../primitives";
import styles from "./input.module.css";

const Input = ({ id, label, variant, type = "text", changeHandler, children,...attributes }) => (
    <Stack space="var(--size-1)" data-variant={variant}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        <input {...attributes} id={id} className={styles.input} type={type} onChange={changeHandler} />
        {children}
    </Stack>
);

export default Input;
