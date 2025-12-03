import core from "puppeteer-core";
// @ts-ignore
    } finally {
    if (browser) {
        await browser.close();
    }
}
}
