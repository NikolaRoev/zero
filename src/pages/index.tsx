import "../assets/styles.css";
import "react-toastify/dist/ReactToastify.min.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";



const root = document.getElementById("root") as HTMLDivElement;
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
        
        <ToastContainer
            position={"bottom-right"}
            hideProgressBar
            autoClose={3000}
        />
    </React.StrictMode>
);
