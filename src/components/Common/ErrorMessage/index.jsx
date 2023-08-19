import { useEffect } from "react";
import { Icon } from "../../../primitives";
import { vibrate } from "../../../utilities";
import styles from "./error-message.module.css";

const ErrorMessage = ({ children }) => {
    useEffect(() => {
        vibrate(200);
    }, []);

    return (
        <p className={styles.errorMessage}>
            <Icon space="0.5ch" direction="ltr" icon="alert-circle">
                {children}
            </Icon>
        </p>
    );
};

export default ErrorMessage;
