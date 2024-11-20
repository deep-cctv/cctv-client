import ky from "ky";
import { createSignal, JSXElement, Show } from "solid-js";

import { setToken, token } from "../service/siganl";

enum FormField {
  TOKEN = "token",
}

export const Authorizer = (props: { children: JSXElement }) => {
  const [error, setError] = createSignal<null | string>(null);
  return (
    <Show fallback={props.children} when={!token()}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          ky.post(`${import.meta.env.VITE_APP_API_URL}/authorize`, {
            json: { token: form.get(FormField.TOKEN) },
          })
            .json<string>()
            .then(
              (token) => {
                setToken(token);
              },
              () => {
                setError("인증에 실패했습니다.");
              },
            );
        }}
      >
        <label>
          인증 토큰
          <input name={FormField.TOKEN} type="password" />
        </label>
      </form>
      <p>{error()}</p>
    </Show>
  );
};
