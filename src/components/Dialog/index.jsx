import { Cluster } from "../../primitives";
import styles from "./dialog.module.scss";

const Dialog = ({ id, title, submitHandler, closeHandler, operation, children }) => {
    const clickHandler = (event) => {
        event.target.closest("dialog").close("close");
    };

    return (
        <dialog
            id={id}
            className={styles.dialog}
            onClose={closeHandler ?? null}
        >
            <form
                method="dialog"
                className={styles.form}
                data-operation={operation}
                autoComplete="off"
                onSubmit={submitHandler}
            >
                <header className={styles.header}>
                    <h3 className={styles.heading}>{title}</h3>
                </header>
                <article className={styles.article}>{children}</article>
                <footer className={styles.footer}>
                    <menu className={styles.menu}>
                        <Cluster
                            justify="end"
                            space="var(--size-2)"
                        >
                            <button
                                className={styles.cancelButton}
                                autoFocus
                                type="reset"
                                onClick={clickHandler}
                                value="cancel"
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                type="submit"
                                value="confirm"
                            >
                                Confirm
                            </button>
                        </Cluster>
                    </menu>
                </footer>
            </form>
        </dialog>
    );
};
export default Dialog;
