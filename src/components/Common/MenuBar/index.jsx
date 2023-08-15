import { Box, Cluster } from "../../../primitives";
import Button from "../Button";
import Switch from "../Switch";
import styles from "./menu-bar.module.css";

const MenuBar = ({ theme, setTheme }) => (
    <Box className={styles.box}>
        <Cluster justify="end">
            {/* <Button clickHandler={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "dark" : "light"}</Button> */}
            <Switch id="switch_theme" label={theme === "light" ? "dark" : "light"} changeHandler={() => setTheme(theme === "light" ? "dark" : "light")} />
        </Cluster>
    </Box>
);

export default MenuBar;
