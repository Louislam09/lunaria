import { useEffect, useState } from "react";
import { batch, observable } from "@legendapp/state";

export const HIDE_STATUS_BAR_KEY = 'hideStatusBar';

export const statusBarState$ = observable({
    hide: false,
})

const useHideStatusBar = (value: boolean = false) => {
    useEffect(() => {
        statusBarState$.hide.set(value);
    }, [value]);
};

export default useHideStatusBar;