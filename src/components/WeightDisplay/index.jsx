import { Fragment, useEffect, useState } from "react";
import { readRows } from "../../supabase";
import styles from "./line-graph.module.scss";

const WeightDisplay = () => {
    const [weightValues, setWeightValues] = useState([]);

    useEffect(() => {
        // readRows("users_weight").then((data) => setWeightValues(data.sort((a, b) => a.weight - b.weight)));
        readRows("users_weight").then((data) => setWeightValues(data));
    }, []);

    // console.log(weightValues)

    return (
        <>
            <p>Weight</p>
            <span>1 week</span>
            <div className={styles.lineGraph}>
                <div
                    className={styles.lines}
                    style={{ "--columns": `${weightValues.length}`, "--rows": `${weightValues.length}` }}
                >
                    {weightValues.map((value, index) => (
                        <Fragment key={value.id}>
                            <div className={styles.line} data-axis="x" style={{ gridRow: index + 1 }}></div>
                            <div className={styles.line} data-axis="y" style={{ gridColumn: index + 1 }}></div>
                        </Fragment>
                    ))}
                </div>

                <div
                    className={styles.points}
                    style={{ "--columns": `${weightValues.length}`, "--rows": `${weightValues.length}` }}
                >
                    {weightValues.map((value, index) => (
                        <div className={styles.point} data-point={value.weight} key={value.id} style={{ gridColumn: index + 1, gridRow: index + 1 }}></div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default WeightDisplay;
