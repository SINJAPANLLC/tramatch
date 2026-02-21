import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

const splash = document.getElementById("splash-screen");
if (splash) {
  splash.style.opacity = "0";
  setTimeout(() => splash.remove(), 400);
}
