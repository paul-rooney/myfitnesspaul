import { Cluster, Icon } from "../../../primitives";
import { formatDate, formatDateISO, getPastDate, getFutureDate } from "../../../utilities";
import Button from "../../Common/Button";

const DateSelector = ({ date, setDate }) => {
    const adjustDate = (event) => {
        const { direction } = event.target.closest("button").dataset;

        switch (direction) {
            case "previous":
                setDate((currentValue) => formatDateISO(getPastDate(currentValue, 1)));
                break;

            case "next":
                setDate((currentValue) => formatDateISO(getFutureDate(currentValue, 1)));
                break;

            default:
                break;
        }
    };

    return (
        <Cluster justify="center" align="baseline">
            <Button data-direction="previous" clickHandler={adjustDate}>
                <Icon space="0.5ch" direction="ltr" icon="chevron-left">
                    Previous
                </Icon>
            </Button>
            <time>{formatDate(new Date(date))}</time>
            <Button data-direction="next" clickHandler={adjustDate}>
                <Icon space="0.5ch" icon="chevron-right">
                    Next
                </Icon>
            </Button>
        </Cluster>
    );
};

export default DateSelector;
