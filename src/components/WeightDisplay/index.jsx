import styles from "./line-graph.module.scss";

const WeightDisplay = () => {
    return (
        <>
            <p>Weight</p>
            <span>1 week</span>
            <div className={styles.lineGraph}>
                <div className={styles.lines}>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                    <div className={styles.line}></div>
                </div>

                <div className={styles.points}>
                    <div className={styles.point} data-point={164.75}></div>
                    <div className={styles.point} data-point={164.25}></div>
                </div>
            </div>
        </>
    );
};

export default WeightDisplay;
