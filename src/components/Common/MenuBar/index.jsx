import { Box, Cluster } from "../../../primitives";
import Button from "../Button";
import styles from "./menu-bar.module.css";

const MenuBar = ({ theme, setTheme }) => (
    <Box className={styles.box}>
        <Cluster justify="end">
            <Button clickHandler={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "dark" : "light"}</Button>
        </Cluster>
    </Box>
);

export default MenuBar;
