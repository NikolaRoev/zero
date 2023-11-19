import "../styles.css";
import MainApp from "./MainApp";
import React from "react";
import ReactDOM from "react-dom/client";



const root = document.getElementById("root") as HTMLDivElement;
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <MainApp />
    </React.StrictMode>
);
