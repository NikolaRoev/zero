import *  as api from "../../../api";



const statusFieldsetContainer = document.getElementById("status-fieldset-container") as HTMLDivElement;
const typeFieldsetContainer = document.getElementById("type-fieldset-container") as HTMLDivElement;
const formatFieldsetContainer = document.getElementById("format-fieldset-container") as HTMLDivElement;



function updateWorkTable() {

}

function updateWorkFilterValues() {
    api.getStatuses().then((statuses) => {
        statusFieldsetContainer.innerHTML = "";

        for (const status of statuses) {
            const checkBox = document.createElement("input");
            checkBox.id = `status-${status.status}-checkbox`;
            checkBox.setAttribute("type", "checkbox");
            checkBox.value = status.status;
            
            if (status.is_update) {
                checkBox.classList.add("update-status-checkbox");
            }

            checkBox.addEventListener("change", () => {
                updateWorkTable();
            });
            statusFieldsetContainer.appendChild(checkBox);

            const label = document.createElement("label");
            label.textContent = status.status;
            label.htmlFor = checkBox.id;
            statusFieldsetContainer.appendChild(label);
        }
    }).catch((reason) => { alert(reason); });

    api.getTypes().then((types) => {
        typeFieldsetContainer.innerHTML = "";

        for (const type of types) {
            const checkBox = document.createElement("input");
            checkBox.id = `type-${type.type}-checkbox`;
            checkBox.setAttribute("type", "checkbox");
            checkBox.value = type.type;

            checkBox.addEventListener("change", () => {
                updateWorkTable();
            });
            typeFieldsetContainer.appendChild(checkBox);

            const label = document.createElement("label");
            label.textContent = type.type;
            label.htmlFor = checkBox.id;
            typeFieldsetContainer.appendChild(label);
        }
    }).catch((reason) => { alert(reason); });

    api.getFormats().then((formats) => {
        formatFieldsetContainer.innerHTML = "";

        for (const format of formats) {
            const checkBox = document.createElement("input");
            checkBox.id = `format-${format.format}-checkbox`;
            checkBox.setAttribute("type", "checkbox");
            checkBox.value = format.format;

            checkBox.addEventListener("change", () => {
                updateWorkTable();
            });
            formatFieldsetContainer.appendChild(checkBox);

            const label = document.createElement("label");
            label.textContent = format.format;
            label.htmlFor = checkBox.id;
            formatFieldsetContainer.appendChild(label);
        }
    }).catch((reason) => { alert(reason); });
}



export function updateLibraryWorks() {
    updateWorkFilterValues();
    updateWorkTable();
}
