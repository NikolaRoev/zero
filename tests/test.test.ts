import { expect, suite } from "vitest";
import { By } from "selenium-webdriver";
import { addStatus } from "./utility";
import { zeroTest } from "./zero-test";



function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

suite("Hello Tauri", () => {
    zeroTest("should be cordial", async ({ driver, database }) => {
        await wait(10000);
    
        const text = await driver.findElement(By.css("body > div > h1")).getText();
        expect(text).toMatch(/^Welcome/);

        await addStatus(driver, database.database);
    });
});
