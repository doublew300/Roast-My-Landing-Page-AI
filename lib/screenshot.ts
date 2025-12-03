import chromium from "@sparticuz/chromium-min";
import core from "puppeteer-core";

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        if (process.env.VERCEL) {
            // Use the library to handle the binary
            // We need to point to the pack.tar for the specific version
            const executablePath = await chromium.executablePath(
                "https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar"
            );

            browser = await core.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless as boolean | "shell" | undefined,
            });
        } else {
            // Local development
            const puppeteer = await import("puppeteer").then(m => m.default);
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox"],
            });
        }

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

        // Wait a bit for animations/fonts
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
