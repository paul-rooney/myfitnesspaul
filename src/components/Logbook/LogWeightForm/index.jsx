import { Icon } from "../../../primitives";
import { supabase, upsertRows } from "../../../supabase";
import Button from "../../Common/Button";
import Input from "../../Common/Input";

const LogWeightForm = ({ weight, setWeight }) => {
    // TODO: If date is in the past, require confirmation to enable form fields for update

    const changeHandler = (event) => {
        const { value } = event.target;

        setWeight(value);
    };

    const logWeight = async (event) => {
        event.preventDefault();

        const { data } = await supabase.auth.getSession();
        const { weight } = event.target;

        const payload = {
            user_id: data.session.user.id,
            weight: weight.value,
        };

        upsertRows("users_weight", payload, { ignoreDuplicates: false, onConflict: "date_entered" });
    };

    return (
        <form onSubmit={logWeight}>
            <Input
                id="weight"
                label="Weight"
                type="number"
                step={0.25}
                value={weight}
                changeHandler={changeHandler}
                variant="fancy"
            >
                <Button variant="secondary" type="submit">
                    <Icon space="0.5ch" direction="ltr" icon="plus">
                        Log weight
                    </Icon>
                </Button>
            </Input>
        </form>
    );
};

export default LogWeightForm;