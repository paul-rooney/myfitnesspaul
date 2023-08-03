import { Center, Cover, Stack } from "../../primitives";
import Button from "../Common/Button";
import Input from "../Common/Input";
import SecondaryHeading from "../Common/SecondaryHeading";
import styles from "./sign-in-form.module.scss";

const SignInForm = ({ handleSubmit }) => (
    <Center className={styles.formWrapper}>
        <Cover centered="div">
            <div>
                <h1 className={styles.branding}>MealMosaic</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <Stack space="var(--size-3)">
                        <SecondaryHeading>Sign in</SecondaryHeading>
                        <Stack space="var(--size-1)">
                            <Input id="email" type="email" label="Email address" required autoCapitalize="none" />
                        </Stack>
                        <Stack space="var(--size-1)">
                            <Input id="password" type="password" label="Password" required />
                        </Stack>
                        <Button type="submit">
                            Sign in
                        </Button>
                    </Stack>
                </form>
            </div>
        </Cover>
    </Center>
);

export default SignInForm;
