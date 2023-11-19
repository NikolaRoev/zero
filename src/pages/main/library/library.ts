import { updateLibraryWorks } from "./library-works";



const worksTabButton = document.getElementById("works-tab-button") as HTMLButtonElement;
const creatorsTabButton = document.getElementById("creators-tab-button") as HTMLButtonElement;
const addWorkTabButton = document.getElementById("add-work-tab-button") as HTMLButtonElement;
const addCreatorTabButton = document.getElementById("add-creator-tab-button") as HTMLButtonElement;



export function updateLibrary() {
    updateLibraryWorks();
}


worksTabButton.addEventListener("click", () => {
    updateLibraryWorks();
});
