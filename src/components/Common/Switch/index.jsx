const Switch = () => (
    <>
        <label htmlFor="switch-3" className="gui-switch">
            Disabled
            <input type="checkbox" role="switch" id="switch-3" disabled />
        </label>

        <label htmlFor="switch-4" className="gui-switch">
            Disabled (checked)
            <input type="checkbox" role="switch" id="switch-4" disabled checked />
        </label>

        <label htmlFor="switch-vertical" className="gui-switch -vertical">
            Vertical
            <input type="checkbox" role="switch" id="switch-vertical" />
        </label>
    </>
);

export default Switch;
