import { Box, Cluster } from "../../../primitives";
import Switch from "../Switch";
import styles from "./menu-bar.module.css";

const MenuBar = ({ theme, setTheme }) => (
    <Box className={styles.box}>
        <Cluster justify="end">
            <Switch id="switch_theme" label={theme} changeHandler={() => setTheme(theme === "light" ? "dark" : "light")} />
        </Cluster>
    </Box>
);

export default MenuBar;
