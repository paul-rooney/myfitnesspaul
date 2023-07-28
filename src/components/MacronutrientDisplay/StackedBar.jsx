import { Cluster } from "../../primitives";

const StackedBar = ({ kcal, c, f, p }) => {
    const cWidth = Math.round(((c * 4) / kcal) * 100);
    const fWidth = Math.round(((f * 9) / kcal) * 100);
    const pWidth = Math.round(((p * 4) / kcal) * 100);

    return (
        <Cluster
            space="0"
            style={{ border: "1px solid var(--surface2)", minBlockSize: "1rem", width: "100%", padding: "var(--size-1)" }}
        >
            <span
                style={{
                    backgroundColor: "var(--jungle-3)",
                    color: "var(--jungle-12)",
                    flexGrow: "1",
                    fontSize: "var(--font-size-00)",
                    fontWeight: "var(--font-weight-7)",
                    letterSpacing: "var(--font-letterspacing-3)",
                    minBlockSize: "1rem",
                    padding: "var(--size-1)",
                    textTransform: "uppercase",
                    width: `${cWidth}%`,
                }}
            >
                Carbohydrate:&nbsp;{c}g
            </span>
            <span
                style={{
                    backgroundColor: "var(--red-3)",
                    color: "var(--red-12)",
                    flexGrow: "1",
                    fontSize: "var(--font-size-00)",
                    fontWeight: "var(--font-weight-7)",
                    letterSpacing: "var(--font-letterspacing-3)",
                    minBlockSize: "1rem",
                    padding: "var(--size-1)",
                    textTransform: "uppercase",
                    width: `${fWidth}%`,
                }}
            >
                Fat:&nbsp;{f}g
            </span>
            <span
                style={{
                    backgroundColor: "var(--orange-3)",
                    color: "var(--orange-10)",
                    flexGrow: "1",
                    fontSize: "var(--font-size-00)",
                    fontWeight: "var(--font-weight-7)",
                    letterSpacing: "var(--font-letterspacing-3)",
                    minBlockSize: "1rem",
                    padding: "var(--size-1)",
                    textTransform: "uppercase",
                    width: `${pWidth}%`,
                }}
            >
                Protein:&nbsp;{p}g
            </span>
        </Cluster>
    );
};

export default StackedBar;
