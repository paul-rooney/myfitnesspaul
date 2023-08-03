import styles from "./primary-heading.module.css";

const PrimaryHeading = ({ children }) => <h2 className={styles.heading}>{children}</h2>;

export default PrimaryHeading;
