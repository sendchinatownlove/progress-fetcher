const { JSDOM } = require("jsdom");
const playwright = require("playwright");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

async function getProgress() {
    const browser = await playwright.chromium.launch({
        headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://square.link/u/h08m5ohB");
    await page.waitForTimeout(500);

    let amount = await page.locator(".donation-progress-amount").innerText();

    await browser.close();

    return amount;
}

app.get("/", async (req, res) => {
    res.send(await getProgress());
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
