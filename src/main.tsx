import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { PetWindow } from "./app/PetWindow";
import "./styles/global.css";

const isPetWindow = new URLSearchParams(window.location.search).get("window") === "pet";
document.body.classList.toggle("pet-window-body-root", isPetWindow);
document.documentElement.classList.toggle("pet-window-root", isPetWindow);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isPetWindow ? <PetWindow /> : <App />}
  </StrictMode>,
);
