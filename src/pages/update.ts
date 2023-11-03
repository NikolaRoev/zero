import *  as api from "../api";



const updateSearch = document.getElementById("update-search") as HTMLInputElement;
const updateList = document.getElementById("update-list") as HTMLDivElement;



export function updateUpdate() {
    api.getUpdateWorks(updateSearch.value).then((works) => {
        updateList.innerHTML = "";

        for (const work of works) {
            const container = document.createElement("div");

            const nameInput = document.createElement("input");
            nameInput.value = work.name;
            nameInput.spellcheck = false;
            nameInput.addEventListener("input", () => {
                api.updateWorkName(work.id, nameInput.value).catch((reason) => { alert(reason); });
            });
            container.appendChild(nameInput);

            const progressInput = document.createElement("input");
            progressInput.value = work.progress;
            progressInput.spellcheck = false;
            progressInput.addEventListener("input", () => {
                api.updateWorkProgress(work.id, progressInput.value).catch((reason) => { alert(reason); });
            });
            container.appendChild(progressInput);

            updateList.appendChild(container);
        }
    }).catch((reason) => { alert(reason); });
}


updateSearch.addEventListener("input", () => {
    updateUpdate();
});

window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "f") {
        event.preventDefault();
        updateSearch.focus();
        updateSearch.select();
    }
});
