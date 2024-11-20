import { Authorizer } from "./components/Authorizer";
import { Cctv } from "./components/Cctv";

export const App = () => {
  return (
    <Authorizer>
      <Cctv />
    </Authorizer>
  );
};
