import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME_EXECUTABLE =
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        if (process.env.NODE_ENV === "development") {
            browser = await puppeteer.launch({
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: LOCAL_CHROME_EXECUTABLE, // Adjust for your local machine
                headless: true,
            });
        } else {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        }

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Set a reasonable timeout
        await page.goto(url, { waitUntil: "load", timeout: 60000 });

        // Add a small delay to ensure animations/lazy loading finish
        await new Promise(r => setTimeout(r, 2000));

        const screenshotBuffer = await page.screenshot({ type: "png" });
        return screenshotBuffer as Buffer;

    } catch (error) {
        console.error("Screenshot capture failed:", error);
        throw new Error("Failed to capture website screenshot. The site might be blocking bots or is unreachable.");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
