import { Builder, Capabilities, WebDriver } from "selenium-webdriver";
import { type Database, default as DatabaseConstructor } from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { test } from "vitest";



type Fixtures = {
    driver: WebDriver,
    database: {
        name: string,
        database: Database
    }
}

export const zeroTest = test.extend<Fixtures>({
    driver: async ({}, use) => {
        const application = path.resolve(
            __dirname,
            "..",
            "src-tauri",
            "target",
            "release",
            "zero.exe"
        );
        
        const tauriDriver = spawn(
            path.resolve(__dirname, "..", "webdriver", "tauri-driver.exe"),
            ["--native-driver", path.resolve(__dirname, "..", "webdriver", "msedgedriver.exe")],
            { stdio: [null, process.stdout, process.stderr] }
        );

        const capabilities = new Capabilities();
        capabilities.set("tauri:options", { application });
        capabilities.setBrowserName("wry");

        const driver = await new Builder()
            .withCapabilities(capabilities)
            .usingServer("http://127.0.0.1:4444/")
            .build();

        await use(driver);

        await driver.quit();
        tauriDriver.kill();
    },
    database: async ({}, use) => {
        const name = `${randomUUID()}.db`;
        const database = new DatabaseConstructor(name);

        await use({ name, database });

        database.close();
        fs.unlinkSync(name);
    }
});
