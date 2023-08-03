import styles from "./secondary-heading.module.css";

const SecondaryHeading = ({ children }) => <h3 className={styles.heading}>{children}</h3>;

export default SecondaryHeading;
