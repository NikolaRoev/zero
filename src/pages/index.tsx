import "../assets/styles.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";



const root = document.getElementById("root") as HTMLDivElement;
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
