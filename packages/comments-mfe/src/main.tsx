import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import Comments from "./App";
import Comments from "./components/Comments";
import "@streamia/shared/styles/index.scss";

export function mount(
  el: HTMLElement,
  props: { movieId: string; token?: string }
) {
  const root = ReactDOM.createRoot(el);
  root.render(
    <BrowserRouter>
      <Comments {...props} />
    </BrowserRouter>
  );
}

if ((import.meta as any).env?.DEV) {
  const el = document.getElementById("root");

  if (el) {
    mount(el, {
      movieId: "68fe73ef1f47ab544c72e3d8", // se simula Demon Slayer
      token: "TEST_TOKEN", 
    });
  }
}
