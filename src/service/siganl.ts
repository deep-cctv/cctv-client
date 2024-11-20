import { createSignal } from "solid-js";

export const [token, setToken] = createSignal<null | string>(null);
