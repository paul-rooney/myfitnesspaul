import { Box } from "../../../primitives";
import styles from "./card.module.css";

const Card = ({ children }) => (
    <Box borderWidth="var(--border-size-1)" className={styles.card}>
        {children}
    </Box>
);

export default Card;
