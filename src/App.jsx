import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { signInWithEmail, supabase } from "./supabase";
import SignInForm from "./components/SignInForm";
import SnapTabs from "./components/SnapTabs";
// import useLocalStorage from "./hooks/useLocalStorage";
import styles from "./app.module.scss";

const App = () => {
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log(session);
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const submitHandler = (event) => {
        event.preventDefault();

        const form = event.target;
        const { email, password } = form;

        const credentials = {
            email: email.value,
            password: password.value,
        };

        signInWithEmail(credentials);
    };

    if (!session) {
        return <SignInForm handleSubmit={submitHandler} />;
    } else {
        return (
            <div className={styles.wrapper}>
                <SnapTabs />
            </div>
        );
    }
};

export default App;
