import { useEffect, useRef, useState } from "react";
import { getPseudoStyle, getStyle } from "../../../utilities";
import styles from "./switch.module.css";

const Switch = ({ id, label, variant = "default", changeHandler }) => {
    const [recentlyDragged, setRecentlyDragged] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [switchData, setSwitchData] = useState({
        thumbsize: 0,
        padding: 0,
        bounds: {
            lower: 0,
            middle: 0,
            upper: 0,
        },
    });
    const element = useRef(null);

    useEffect(() => {
        isChecked ? changeHandler(true) : changeHandler(false);
    }, [isChecked]);

    useEffect(() => {
        if (!element) return;

        const label = element.current;
        const checkbox = label.querySelector("input");
        const thumbsize = getPseudoStyle(checkbox, "width");
        const padding = getStyle(checkbox, "padding-left") + getStyle(checkbox, "padding-right");

        setSwitchData({
            thumbsize,
            padding,
            bounds: {
                lower: 0,
                middle: (checkbox.clientWidth - padding) / 4,
                upper: checkbox.clientWidth - thumbsize - padding,
            },
        });

        label.addEventListener("click", labelClick);
        checkbox.addEventListener("pointerdown", dragInit);
        checkbox.addEventListener("pointerup", dragEnd);

        return () => {
            label.removeEventListener("click", labelClick);
            checkbox.removeEventListener("pointerdown", dragInit);
            checkbox.removeEventListener("pointerup", dragEnd);
        };
    }, []);

    const dragInit = (event) => {
        if (event.target.disabled) return;

        event.target.addEventListener("pointermove", dragging);
        event.target.style.setProperty("--thumb-transition-duration", "0s");
    };

    const dragging = (event) => {
        let { thumbsize, bounds, padding } = switchData;
        let directionality = getStyle(event.target, "--isLTR");

        let track = directionality === -1 ? event.target.clientWidth * -1 + thumbsize + padding : 0;

        let pos = Math.round(event.offsetX - thumbsize / 2);

        if (pos < bounds.lower) pos = 0;
        if (pos > bounds.upper) pos = bounds.upper;

        event.target.style.setProperty("--thumb-position", `${track + pos}px`);
    };

    const dragEnd = (event) => {
        const checkbox = element.current.querySelector("input");

        const checked = determineChecked();
        checkbox.checked = checked;
        setIsChecked(checked);

        if (event.target.indeterminate) {
            event.target.indeterminate = false;
        }

        event.target.style.removeProperty("--thumb-transition-duration");
        event.target.style.removeProperty("--thumb-position");
        event.target.removeEventListener("pointermove", dragging);

        padRelease();
    };

    const padRelease = () => {
        setRecentlyDragged(true);

        setTimeout(() => {
            setRecentlyDragged(false);
        }, 300);
    };

    const labelClick = (event) => {
        preventBubbles(event);

        const checkbox = element.current.querySelector("input");

        if (recentlyDragged || checkbox.disabled) return;

        checkbox.checked = !checkbox.checked;
        setIsChecked(checkbox.checked);
    };

    const preventBubbles = (event) => {
        if (recentlyDragged) {
            event.preventDefault() && event.stopPropagation();
        }
    };

    const determineChecked = () => {
        const checkbox = element.current.querySelector("input");

        let { bounds } = switchData;
        let curpos = Math.abs(parseInt(element.current.style.getPropertyValue("--thumb-position")));

        if (!curpos) {
            curpos = checkbox.checked ? bounds.lower : bounds.upper;
        }

        return curpos >= bounds.middle;
    };

    return (
        <label htmlFor={id} data-variant={variant} className={styles.switch} data-switch ref={element}>
            <span>{label}</span>
            <input id={id} type="checkbox" role="switch" />
        </label>
    );
};

export default Switch;
