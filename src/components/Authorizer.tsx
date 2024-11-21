import ky from "ky";
import { createSignal, JSXElement, Show } from "solid-js";

import { auth, setAuth } from "../service/siganl";

enum FormField {
  CLIENT_NAME = "client_name",
  TOKEN = "token",
}

export const Authorizer = (props: { children: JSXElement }) => {
  const [error, setError] = createSignal<null | string>(null);
  return (
    <Show fallback={props.children} when={!auth()}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const payload = {
            token: form.get(FormField.TOKEN) as string,
            client_name: form.get(FormField.CLIENT_NAME) as string,
          };
          ky.post(`${import.meta.env.VITE_APP_API_URL}/authorize`, {
            json: payload,
          })
            .json<string>()
            .then(
              () => {
                setAuth(payload);
              },
              () => {
                setError("인증에 실패했습니다.");
              },
            );
        }}
      >
        <label>
          인증 토큰
          <input id={FormField.TOKEN} name={FormField.TOKEN} type="password" />
        </label>
        <label>
          클라이언트 이름
          <input
            id={FormField.CLIENT_NAME}
            name={FormField.CLIENT_NAME}
            type="text"
          />
        </label>
        <button>완료</button>
      </form>
      <p>{error()}</p>
    </Show>
  );
};
