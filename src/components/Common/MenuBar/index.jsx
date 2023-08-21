import { Box, Cluster } from "../../../primitives";
import { signOut } from "../../../supabase";
import Button from "../Button";
import Switch from "../Switch";
import styles from "./menu-bar.module.css";

const MenuBar = ({ theme, setTheme }) => (
    <Box className={styles.box}>
        <Cluster justify="space-between" align="center">
            <Switch id="switch_theme" label={theme} variant="compact" changeHandler={(isChecked) => setTheme(isChecked ? "dark" : "light")} />
            <Button variant="small" clickHandler={signOut}>Sign out</Button>
        </Cluster>
    </Box>
);

export default MenuBar;
