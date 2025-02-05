const { JSDOM } = require("jsdom");
const playwright = require("playwright");
const express = require("express");
const mcache = require("memory-cache");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const cacheTime = process.env.CACHE_TIME || 5;

app.use(cors());

const cache = (duration) => {
    return (req, res, next) => {
        let key = "__express__" + req.originalUrl || req.url;
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
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

async function getProgress(checkoutID) {
    let squareUrl = "https://checkout.square.site/merchant/B4M6RCB1WWG5F/checkout/W3OO2333C5MMCSJS3SBUOQN4";

    if (checkoutID) {
        squareUrl = "https://checkout.square.site/merchant/B4M6RCB1WWG5F/checkout/" + checkoutID;
    }

    try {
        const browser = await playwright.chromium.launch({
            headless: true,
        });
    
        const page = await browser.newPage();
        await page.goto(squareUrl);
        await page.waitForTimeout(400);
    
        let loc = page.locator(".donation-progress-amount");
        let amount = await loc.innerText();
        amount = Number.parseInt(amount.substring(1).replace(/,/g, ""));
    
        await browser.close();

        return { amount: amount };
    }
    catch (err) {
        return err;
    }
}

app.get("/", cache(cacheTime), async (req, res) => {
    res.send(await getProgress());
});

app.get("/:checkoutID", cache(cacheTime), async (req, res) => {
    res.send(await getProgress(req.params.checkoutID));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
