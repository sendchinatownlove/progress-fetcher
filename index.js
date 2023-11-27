const { JSDOM } = require("jsdom");
const playwright = require("playwright");
const express = require("express");
var mcache = require("memory-cache");
var cors = require('cors')

const app = express();
const port = process.env.PORT || 3000;
const cacheTime = process.env.CACHE_TIME || 5;

app.use(cors())

var cache = (duration) => {
    return (req, res, next) => {
        let key = "__express__" + req.originalUrl || req.url;
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 60000);
                res.sendResponse(body);
            };
            next();
        }
    };
};

async function getProgress() {
    const browser = await playwright.chromium.launch({
        headless: true,
    });

    const page = await browser.newPage();
    await page.goto("https://square.link/u/FsSrAUPG");
    await page.waitForTimeout(400);

    let amount = await page.locator(".donation-progress-amount").innerText();
    amount = Number.parseInt(amount.substring(1).replace(/,/g, ""));

    await browser.close();

    return { amount: amount };
}

app.get("/", cache(cacheTime), async (req, res) => {
    res.send(await getProgress());
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
