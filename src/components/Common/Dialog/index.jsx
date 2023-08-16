import { Cluster } from "../../../primitives";
import Button from "../Button";
import SecondaryHeading from "../SecondaryHeading";
import styles from "./dialog.module.css";

const Dialog = ({ id, title, submitHandler, closeHandler, operation, children }) => {
    const clickHandler = (event) => {
        event.target.closest("dialog").close("close");
    };

    return (
        <dialog id={id} className={styles.dialog} onClose={closeHandler ?? null}>
            <form method="dialog" className={styles.form} data-operation={operation} autoComplete="off" onSubmit={submitHandler}>
                <header className={styles.header}>
                    <SecondaryHeading>{title}</SecondaryHeading>
                </header>
                <article className={styles.article}>{children}</article>
                <footer className={styles.footer}>
                    <menu className={styles.menu}>
                        <Cluster justify="end" space="var(--size-2)">
                            <Button autoFocus type="reset" clickHandler={clickHandler} value="cancel">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" value="confirm">
                                Confirm
                            </Button>
                        </Cluster>
                    </menu>
                </footer>
            </form>
        </dialog>
    );
};
export default Dialog;
