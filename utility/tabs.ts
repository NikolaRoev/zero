/**
 * Registers all confirm buttons (elements with the `util-confirm-button` class) on import.
 * Must be imported before all other `click` listeners are added to any confirm button.
 * 
 * Each confirm button should have the custom data attribute `data-util-confirm`
 * for the confirmation state text.
 * 
 * Optionally, each confirm button can have the custom data attribute `data-util-delay`
 * for a custom delay duration before returning to the initial state. Default is `1500` ms.
 */

(() => {
    const tabBars = document.getElementsByClassName("util-tab-bar") as HTMLCollectionOf<HTMLElement>;
    const tabContainers = document.getElementsByClassName("util-tab-container") as HTMLCollectionOf<HTMLElement>;
    const numTabElements = tabBars.length;

    for (let i = 0; i < numTabElements; ++i) {
        const tabButtons = tabBars[i]?.getElementsByClassName("util-tab-button") as HTMLCollectionOf<HTMLElement>;
        const tabPages = tabContainers[i]?.getElementsByClassName("util-tab-page") as HTMLCollectionOf<HTMLElement>;
        const numTabs = tabButtons.length;

        for (const tabButton of tabButtons) {
            // Initial setup.
            if (tabButton.classList.contains("util-active")) {
                for (const tabPage of tabPages) {
                    if (tabPage.dataset.utilTabButtonId !== tabButton.id) {
                        tabPage.classList.add("util-hidden");
                    }
                }
            }
    
            tabButton.addEventListener("click", () => {
                if (!tabButton.classList.contains("util-active")) {
                    tabButton.classList.add("util-active");
        
                    for (let j = 0; j < numTabs; ++j) {
                        if (tabButtons[j]?.id !== tabButton.id) {
                            tabButtons[j]?.classList.remove("util-active");
                        }
    
                        if (tabPages[j]?.dataset.utilTabButtonId === tabButton.id) {
                            tabPages[j]?.classList.remove("util-hidden");
                        }
                        else {
                            tabPages[j]?.classList.add("util-hidden");
                        }
                    }
                }
            });
        }
    }
})();
