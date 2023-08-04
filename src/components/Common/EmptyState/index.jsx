import styles from "./empty-state.module.css";

const EmptyState = ({ children }) => <p className={styles.emptyState}>{children}</p>;

export default EmptyState;
