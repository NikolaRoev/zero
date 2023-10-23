import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

//async function greet() {
//    const test = await invoke("add_creator", {
//        name: greetInputEl.value,
//        works: []
//    });
//    console.log(test);
//}

window.addEventListener("DOMContentLoaded", () => {
    //
});

await listen("closed-database", () => {
    console.log("close");
    document.body.innerHTML = "<h1>!!!!!!!!!!!!!</h1>";
});

await listen("opened-database", () => {
    document.body.innerHTML = "<h1>!!!!!!!!!!!!!</h1>";
    console.log("open");
});
