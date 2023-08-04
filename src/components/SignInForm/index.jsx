import { Center, Cover, Stack } from "../../primitives";
import Button from "../Common/Button";
import Card from "../Common/Card";
import Input from "../Common/Input";
import SecondaryHeading from "../Common/SecondaryHeading";
import styles from "./sign-in-form.module.scss";

const SignInForm = ({ handleSubmit }) => (
    <Center>
        <Cover centered="div">
            <div style={{  }}>
                {/* TODO: Replace with logo */}
                <h1 className={styles.branding}>MealMosaic</h1>
                <Card>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Stack space="var(--size-3)">
                            <SecondaryHeading>Sign in</SecondaryHeading>
                            <Input id="email" type="email" label="Email address" required autoCapitalize="none" />
                            <Input id="password" type="password" label="Password" required />
                            <Button variant="primary" style={{ marginInlineStart: "auto" }} type="submit">
                                Sign in
                            </Button>
                        </Stack>
                    </form>
                </Card>
            </div>
        </Cover>
    </Center>
);

export default SignInForm;
