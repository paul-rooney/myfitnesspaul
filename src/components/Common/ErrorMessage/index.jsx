import { Icon } from "../../../primitives";
import styles from "./error-message.module.css";

const ErrorMessage = ({ children }) => (
    <p className={styles.errorMessage}>
        <Icon space="0.5ch" direction="ltr" icon="alert-circle">
            {children}
        </Icon>
    </p>
);

export default ErrorMessage;
