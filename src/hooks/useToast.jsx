import { useEffect, useRef } from "react";
import styles from "../components/Common/Toast/toast.module.css";

const useToast = () => {
    const toaster = useRef(null);

    const createToast = (text) => {
        const toast = document.createElement("output");

        toast.innerText = text;
        toast.classList.add(styles.toast);
        toast.setAttribute("role", "status");

        return toast;
    };

    const addToast = (toast) => {
        const { matches: motionOK } = window.matchMedia("prefers-reduced-motion: no-preference");

        toaster.current.children.length
            ? // && motionOK
              flipToast(toast)
            : toaster.current.appendChild(toast);
    };

    const flipToast = (toast) => {
        const first = toaster.current.offsetHeight;

        toaster.current.appendChild(toast);

        const last = toaster.current.offsetHeight;

        const invert = last - first;

        const animation = toaster.current.animate([{ transform: `translateY(${invert}px)` }, { transform: "translateY(0)" }], {
            duration: 150,
            easing: "ease-out",
        });
    };

    const showToast = (text) => {
        let toast = createToast(text);
        addToast(toast);

        return new Promise(async (resolve) => {
            await Promise.allSettled(toast.getAnimations().map((animation) => animation.finished));
            toaster.current.removeChild(toast);
            resolve();
        });
    };

    useEffect(() => {
        toaster.current = document.createElement("section");
        toaster.current.classList.add(styles.toaster);
        document.body.appendChild(toaster.current);

        return () => {
            document.body.removeChild(toaster.current);
        };
    }, []);

    return showToast;
};

export default useToast;
