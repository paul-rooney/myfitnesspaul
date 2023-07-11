import { Center, Cover, Stack } from "../../primitives";
import styles from "./sign-in-form.module.scss";

const SignInForm = ({ handleSubmit }) => (
    <Center className={styles.formWrapper}>
        <Cover centered="form">
            <form className={styles.form} onSubmit={handleSubmit}>
                <Stack space="var(--size-3)">
                <h1 className={styles.heading}>Sign in</h1>
                    <Stack space="var(--size-1)">
                        <label className={styles.label} htmlFor="email">
                            Email address
                        </label>
                        <input className={styles.input} id="email" type="email" required />
                    </Stack>
                    <Stack space="var(--size-1)">
                        <label className={styles.label} htmlFor="password">
                            Password
                        </label>
                        <input className={styles.input} id="password" type="password" required />
                    </Stack>
                    <button className={styles.submitButton} type="submit">
                        Sign in
                    </button>
                </Stack>
            </form>
        </Cover>
    </Center>
);

export default SignInForm;
