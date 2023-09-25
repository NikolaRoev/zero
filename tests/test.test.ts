import path from "path";
import { ChildProcessByStdio, spawn } from "child_process";
import { Builder, By, Capabilities, WebDriver } from "selenium-webdriver";
import { Writable } from "stream";

// create the path to the expected application binary
const application = path.resolve(
  __dirname,
  "..",
  "src-tauri",
  "target",
  "release",
  "test_test.exe"
);

// keep track of the webdriver instance we create
let driver: WebDriver;

// keep track of the tauri-driver process we start
let tauriDriver: ChildProcessByStdio<Writable, null, null>;

beforeEach(async function() {
  // set timeout to 2 minutes to allow the program to build if it needs to
  //this.timeout(1000)

  // ensure the program has been built
  //spawnSync("cargo", ["build", "--release"]);

  // start tauri-driver
  
  tauriDriver = spawn(
    path.resolve(__dirname, "..", "webdriver", "tauri-driver.exe"),
    ["--native-driver", path.resolve(__dirname, "..", "webdriver", "msedgedriver.exe")],
    { stdio: [null, process.stdout, process.stderr] }
  );

  const capabilities = new Capabilities();
  capabilities.set("tauri:options", { application });
  capabilities.setBrowserName("wry");

  // start the webdriver client
  driver = await new Builder()
    .withCapabilities(capabilities)
    .usingServer("http://127.0.0.1:4444/")
    .build();
});

afterEach(async function() {
  // stop the webdriver session
  await driver.quit();

  // kill the tauri-driver process
  tauriDriver.kill();
});

describe("Hello Tauri", () => {
  it("should be cordial", async () => {
    
    const text = await driver.findElement(By.css("body > div > h1")).getText();
    expect(text).toMatch(/^Welcome/);
  });
});
