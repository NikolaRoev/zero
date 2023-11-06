function getTabPage(tabButton: HTMLElement): HTMLElement {
    if (tabButton.dataset.utilTabPageId === undefined) {
        throw Error(`Missing tab page id data attribute for '${tabButton.id}'.`);
    }

    const tabPage = document.getElementById(tabButton.dataset.utilTabPageId);
    if (tabPage === null) {
        throw Error(`Missing tab page element with id '${tabButton.dataset.utilTabPageId}'.`);
    }
    return tabPage;
}

function makeTab(targetTabButton: HTMLElement, tabButtons: HTMLCollectionOf<HTMLElement>) {
    const targetTabPage = getTabPage(targetTabButton);
    if (!targetTabButton.classList.contains("util-active")) {
        targetTabPage.classList.add("util-hidden");
    }

    targetTabButton.addEventListener("click", () => {
        if (!targetTabButton.classList.contains("util-active")) {
            targetTabButton.classList.add("util-active");
            targetTabPage.classList.remove("util-hidden");

            for (const tabButton of tabButtons) {
                if (tabButton.id !== targetTabButton.id) {
                    tabButton.classList.remove("util-active");
                    getTabPage(tabButton).classList.add("util-hidden");
                }
            }
        }
    });
}

function makeTabs(tabBar: HTMLElement) {
    const tabButtons = tabBar.getElementsByClassName("util-tab-button") as HTMLCollectionOf<HTMLElement>;
    for (const tabButton of tabButtons) {
        makeTab(tabButton, tabButtons);
    }
}

/**
 * Modifies all HTML structures in the following format to behave like tabs:
 * 
 * <div class="tab-bar">
 *   <button class="tab-button active" id="first-tab-button" data-tab-page-id="first-tab">First</button>
 *   <button class="tab-button" id="second-tab-button" data-tab-page-id="second-tab">Second</button>
 *   ...
 * </div>
 * <div id="first-tab">...</div>
 * <div id="second-tab">...</div>
 * ...
 * 
 * The button with the 'active' class will have its tab as the initially selected one.
 * After a tab button is clicked the 'active' class will be added to it,
 * the 'hidden' class will be removed from its page and added to all other pages.
 */

(() => {
    const tabBars = document.getElementsByClassName("util-tab-bar") as HTMLCollectionOf<HTMLElement>;
    for (const tabBar of tabBars) {
        makeTabs(tabBar);
    }
})();
