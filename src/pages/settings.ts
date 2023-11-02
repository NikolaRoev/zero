import "../../utility/tabs";
import *  as api from "../api";
import { appWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { makeConfirmButton } from "../../utility/confirm-button";



const statusesForm = document.getElementById("statuses-form") as HTMLFormElement;
const statusInput = document.getElementById("status-input") as HTMLInputElement;
const typesForm = document.getElementById("types-form") as HTMLFormElement;
const typeInput = document.getElementById("type-input") as HTMLInputElement;
const formatsForm = document.getElementById("formats-form") as HTMLFormElement;
const formatInput = document.getElementById("format-input") as HTMLInputElement;

const statusesList = document.getElementById("statuses-list") as HTMLDivElement;
const typesList = document.getElementById("types-list") as HTMLDivElement;
const formatsList = document.getElementById("formats-list") as HTMLDivElement;



function updateStatuses() {
    api.getStatuses().then((statuses) => {
        statusesList.innerHTML = "";
        
        for (const status of statuses) {
            const container = document.createElement("div");
            container.innerHTML = `<p>${status.status}</p>`;

            const checkBox = document.createElement("input");
            checkBox.setAttribute("type", "checkbox");
            checkBox.checked = status.is_update;
            checkBox.addEventListener("change", () => {
                api.updateStatus(status.id, checkBox.checked).catch((reason) => { alert(reason); });
            });
            container.appendChild(checkBox);

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "<img src=\"/icons/trash.svg\">";
            makeConfirmButton(deleteButton, "<img src=\"/icons/x-circle.svg\">");
            deleteButton.addEventListener("click", () => {
                api.removeStatus(status.id).then(() => { updateStatuses(); }).catch((reason) => { alert(reason); });
            });
            container.appendChild(deleteButton);

            statusesList.appendChild(container);
        }
    }).catch((reason) => { alert(reason); });
}

function updateTypes() {
    api.getTypes().then((types) => {
        typesList.innerHTML = "";
        
        for (const type of types) {
            const container = document.createElement("div");
            container.innerHTML = `<p>${type.type}</p>`;

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "<img src=\"/icons/trash.svg\">";
            makeConfirmButton(deleteButton, "<img src=\"/icons/x-circle.svg\">");
            deleteButton.addEventListener("click", () => {
                api.removeType(type.id).then(() => { updateTypes(); }).catch((reason) => { alert(reason); });
            });
            container.appendChild(deleteButton);

            typesList.appendChild(container);
        }
    }).catch((reason) => { alert(reason); });
}

function updateFormats() {
    api.getFormats().then((formats) => {
        formatsList.innerHTML = "";
        
        for (const format of formats) {
            const container = document.createElement("div");
            container.innerHTML = `<p>${format.format}</p>`;

            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "<img src=\"/icons/trash.svg\">";
            makeConfirmButton(deleteButton, "<img src=\"/icons/x-circle.svg\">");
            deleteButton.addEventListener("click", () => {
                api.removeFormat(format.id).then(() => { updateFormats(); }).catch((reason) => { alert(reason); });
            });
            container.appendChild(deleteButton);

            formatsList.appendChild(container);
        }
    }).catch((reason) => { alert(reason); });
}


statusesForm.addEventListener("submit", (event) => {
    event.preventDefault();

    api.addStatus(statusInput.value).then(() => {
        statusesForm.reset();
        updateStatuses();
    }).catch((reason) => { alert(reason); });
});

typesForm.addEventListener("submit", (event) => {
    event.preventDefault();

    api.addType(typeInput.value).then(() => {
        typesForm.reset();
        updateTypes();
    }).catch((reason) => { alert(reason); });
});

formatsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    api.addFormat(formatInput.value).then(() => {
        formatsForm.reset();
        updateFormats();
    }).catch((reason) => { alert(reason); });
});


await listen("closed-database", () => {
    appWindow.close().catch(async (reason) => {
        await api.error(`Failed to close settings on database closed event: ${reason}.`);
    });
});


updateStatuses();
updateTypes();
updateFormats();
