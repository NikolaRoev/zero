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

    for (const tabBar of tabBars) {
        const tabButtons = tabBar.getElementsByClassName("util-tab-button") as HTMLCollectionOf<HTMLElement>;

        const tabPages: HTMLElement[] = [];
        for (const tabButton of tabButtons) {
            if (tabButton.dataset.utilTabPageId === undefined) {
                throw Error("");
            }
            const tabPage = document.getElementById(tabButton.dataset.utilTabPageId);

            if (tabPage === null) {
                throw Error("");
            }
            if (!tabButton.classList.contains("util-active")) {
                tabPage.classList.add("util-hidden");
            }
            tabPages.push(tabPage);
        }

        for (const tabButton of tabButtons) {
            tabButton.addEventListener("click", () => {
                if (!tabButton.classList.contains("util-active")) {
                    tabButton.classList.add("util-active");
        
                    for (let j = 0; j < tabButtons.length; ++j) {
                        if (tabButtons[j]?.id !== tabButton.id) {
                            tabButtons[j]?.classList.remove("util-active");
                        }
    
                        if (tabPages[j]?.id === tabButton.dataset.utilTabPageId) {
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
