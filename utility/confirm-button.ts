/**
 * Modifies a button to require a second click, done in a specified timeframe,
 * to execute any other `click` listeners.
 * 
 * @param button An existing button element.
 * @param confirmText The contents of the button's HTML during the confirm state.
 * @param delay Time in milliseconds to wait in the confirm state before reverting to the initial state. Default is `1500` ms.
 */
export function makeConfirmButton(button: HTMLElement, confirmText: string, delay = 1500) {
    const initialText = button.innerHTML;
    button.dataset.utilTriggered = "no";

    button.addEventListener("click", (event) => {
        if (button.dataset.utilTriggered === "no") {
            event.stopImmediatePropagation();

            button.innerHTML = confirmText;
            button.dataset.utilTriggered = "yes";
            setTimeout(() => {
                button.dataset.utilTriggered = "no";
                button.innerHTML = initialText;
            }, delay);
        }
    });
}

/**
 * Registers all confirm buttons (elements with the `util-confirm-button` class).
 * Must be called before all other `click` listeners are added to any confirm button.
 * 
 * Each confirm button should have the custom data attribute `data-util-confirm-text`
 * for the confirmation state text.
 * 
 * Optionally, each confirm button can have the custom data attribute `data-util-delay`
 * for a custom delay duration before returning to the initial state. Default is `1500` ms.
 */
export function registerConfirmButtons() {
    const confirmButtons = document.getElementsByClassName("util-confirm-button") as HTMLCollectionOf<HTMLElement>;

    for (const button of confirmButtons) {
        const confirmText = button.dataset.utilConfirmText ?? "Confirm";
        const delay = button.dataset.utilDelay ? parseInt(button.dataset.utilDelay) : undefined;

        makeConfirmButton(button, confirmText, delay);
    }
}
