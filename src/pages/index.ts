import "../../utility/tabs";
import *  as api from "../api";
import { listen } from "@tauri-apps/api/event";
import { updateUpdate } from "./update";



const startupContainer = document.getElementById("startup-container") as HTMLDivElement;
const applicationContainer = document.getElementById("application-container") as HTMLDivElement;



function updateStartup() {
    startupContainer.classList.remove("util-hidden");
    applicationContainer.classList.add("util-hidden");

}

function updateApplication() {
    startupContainer.classList.add("util-hidden");
    applicationContainer.classList.remove("util-hidden");

    updateUpdate();
}


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
