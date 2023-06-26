import { Cluster, Stack } from "../../primitives";
import { formatDate } from "../../utilities";
import styles from "./logbook.module.scss";

const Logbook = () => {
    const submitHandler = (event) => {
        event.preventDefault();

        const form = event.target;
        console.log(form);
    };

    return (
        <>
            <h2 className={styles.heading}>Log</h2>
            <time>{formatDate(new Date(), "en-GB")}</time>
            <form onSubmit={submitHandler}>
                <Stack>
                    <Stack space="var(--size-1)">
                        <label html="weight">Weight</label>
                        <input
                            id="weight"
                            type="number"
                        />
                    </Stack>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Breakfast</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label html="breakfast"></label>
                            <input id="breakfast" /> */}
                        </Stack>
                    </fieldset>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Lunch</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label html="lunch"></label>
                            <input id="lunch" /> */}
                        </Stack>
                    </fieldset>
                    <fieldset>
                        <Stack space="var(--size-1)">
                            <Cluster justify="space-between" space="var(--size-3)">
                                <legend>Dinner</legend>
                                <button type="button">Add</button>
                            </Cluster>
                            {/* <label html="dinner"></label>
                            <input id="dinner" /> */}
                        </Stack>
                    </fieldset>
                </Stack>
            </form>
        </>
    );
};

export default Logbook;
