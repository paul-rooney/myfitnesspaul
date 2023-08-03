import styles from "./stacked-bar.module.scss";

const StackedBar = ({ kcal, c, f, p }) => {
    const cWidth = Math.ceil(((c * 4) / kcal) * 100);
    const fWidth = Math.ceil(((f * 9) / kcal) * 100);
    const pWidth = Math.ceil(((p * 4) / kcal) * 100);

    return (
        <div className={styles.stackedBar}>
            <span
                className={`${styles.bar} ${styles.barCarbohydrate}`}
                style={{
                    "--width": cWidth,
                }}
            >
                Carbohydrate
                <br />
                {Math.round(c)}&thinsp;<span className="text-transform:lowercase">g</span>
            </span>
            <span
                className={`${styles.bar} ${styles.barFat}`}
                style={{
                    "--width": fWidth,
                }}
            >
                Fat
                <br />
                {Math.round(f)}&thinsp;<span className="text-transform:lowercase">g</span>
            </span>
            <span
                className={`${styles.bar} ${styles.barProtein}`}
                style={{
                    "--width": pWidth,
                }}
            >
                Protein
                <br />
                {Math.round(p)}&thinsp;<span className="text-transform:lowercase">g</span>
            </span>
        </div>
    );
};

export default StackedBar;
