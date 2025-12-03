import core from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

// Direct link to the verified browser build (version 132)
const CHROMIUM_URL = "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar";

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;

    try {
        if (process.env.VERCEL) {
            // === VERCEL CONFIGURATION ===
            // Specify the link to download the binary
            const executablePath = await chromium.executablePath(CHROMIUM_URL);

            browser = await core.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: executablePath,
                headless: chromium.headless,
            });

        } else {
            // === LOCALHOST CONFIGURATION ===
            const puppeteer = await import("puppeteer").then(m => m.default);
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox"],
            });
        }

        const page = await browser.newPage();
        // Set a real user agent to avoid getting blocked immediately
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

        await page.setViewport({ width: 1280, height: 800 });

        // Set a reasonable timeout
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

        // Add a small delay to ensure animations/lazy loading finish
        await new Promise(r => setTimeout(r, 2000));

        const screenshotBuffer = await page.screenshot({ type: "png" });
        return screenshotBuffer as Buffer;

    } catch (error: any) {
        console.error("Screenshot capture failed:", error);
        throw new Error(`Screenshot failed: ${error.message || error}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
