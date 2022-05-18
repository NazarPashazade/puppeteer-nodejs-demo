const puppeteer = require("puppeteer");
const fs = require("fs");

const url = "https://nazarpashazade.github.io/demo-pages-for-puppeteer-nodejs";

const start = async() => {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.goto(url, { timeout: 0, waitUntil: "load" });

    await page.setDefaultNavigationTimeout(0);

    await makeScreenshots(page);

    await writeTitlesToFile(page);

    await uploadImagesToLocal(page);

    await readData(page);

    await readDataFromNewPage(page);

    await browser.close();
};

start();

const readData = async(page) => {
    await page.click("#clickme");
    const text = await page.$eval("#data", (n) => n.textContent);
    console.log(text);
};

const readDataFromNewPage = async(page) => {
    await page.type("#ourfield", "blue");
    await Promise.all([page.click("#ourform button"), page.waitForNavigation()]);
    const text = await page.$eval("#message", (n) => n.textContent);
    console.log(text);
};

//  ---  Make screenshots
const makeScreenshots = async(page) => {
    await page.screenshot({ path: "test/page.png" });
    await page.screenshot({ path: "page_full.png", fullPage: true });
};

//  ---  Write titles(image) to .txt file
const writeTitlesToFile = async(page) => {
    const titles = await page.evaluate(() => {
        const nodes = document.querySelectorAll(".info strong");
        return Array.from(nodes, (n) => n.textContent);
    });
    await fs.writeFileSync("titles.txt", titles.join("\n"));
};

//  ---  Upload Images to local folder
const uploadImagesToLocal = async(page) => {
    const urls = await page.$$eval("img", (imgs) => imgs.map((x) => x.src));

    for (const url of urls) {
        const imagePage = await page.goto(url);
        const imageBuffer = await imagePage.buffer();
        const imageName = url.split("/").pop();
        await fs.writeFileSync(imageName, imageBuffer);
    }
};