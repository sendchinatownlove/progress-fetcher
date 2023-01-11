const { JSDOM } = require("jsdom");
const playwright = require("playwright");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

var cache = (duration) => {
    return (req, res, next) => {
      let key = '__express__' + req.originalUrl || req.url
      let cachedBody = mcache.get(key)
      if (cachedBody) {
        res.send(cachedBody)
        return
      } else {
        res.sendResponse = res.send
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body)
        }
        next()
      }
    }
  }

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

app.get("/", cache(10), async (req, res) => {
    res.send(await getProgress());
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
