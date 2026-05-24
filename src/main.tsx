import React from "react";
import ReactDOM from "react-dom/client";
import "./plugins";
import { UnifiedApp } from "./shell/UnifiedApp";
import "./admin/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UnifiedApp />
  </React.StrictMode>,
);
