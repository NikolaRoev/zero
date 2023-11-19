/*import "../../utility/tabs";
import *  as api from "../api";
import { listen } from "@tauri-apps/api/event";
import { updateLibrary } from "./library";
import { updateUpdate } from "./update";



const startupContainer = document.getElementById("startup-container") as HTMLDivElement;
const applicationContainer = document.getElementById("application-container") as HTMLDivElement;
const updateTabButton = document.getElementById("update-tab-button") as HTMLButtonElement;
const libraryTabButton = document.getElementById("library-tab-button") as HTMLButtonElement;


function updateStartup() {
    startupContainer.classList.remove("util-hidden");
    applicationContainer.classList.add("util-hidden");

}

function updateApplication() {
    startupContainer.classList.add("util-hidden");
    applicationContainer.classList.remove("util-hidden");

    updateUpdate();
    //updateLibrary();
}


updateTabButton.addEventListener("click", () => {
    updateUpdate();
});

libraryTabButton.addEventListener("click", () => {
    updateLibrary();
});




await listen("closed-database", () => {
    updateStartup();
});

await listen("opened-database", () => {
    updateApplication();
});


api.databaseIsOpen().then((isOpen) => {
    if (isOpen) {
        updateApplication();
    }
    else {
        updateStartup();
    }
}).catch((reason) => { alert(reason); });
*/

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
