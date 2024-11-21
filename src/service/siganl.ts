import { createSignal } from "solid-js";

export const [auth, setAuth] = createSignal<{
  client_name: string;
  token: string;
} | null>(null);
