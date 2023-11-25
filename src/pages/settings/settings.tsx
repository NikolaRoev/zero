import "../../assets/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import SettingsApp from "./SettingsApp";



const root = document.getElementById("root") as HTMLDivElement;
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <SettingsApp />
    </React.StrictMode>
);
