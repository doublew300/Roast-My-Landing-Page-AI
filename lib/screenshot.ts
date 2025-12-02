import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function captureScreenshot(url: string): Promise<Buffer> {
    // Vercel / AWS Lambda config
    // Important: load font, otherwise text might not appear
    await chromium.font("https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf");

    const isVercel = !!process.env.VERCEL;

    let browser;

    try {
        if (isVercel) {
            // VERCEL LAUNCH CONFIG
            browser = await puppeteer.launch({
                args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } else {
            // LOCAL LAUNCH CONFIG
            const localPuppeteer = await import("puppeteer").then(m => m.default);
            browser = await localPuppeteer.launch({
                headless: true, // "new" is deprecated in newer versions but valid for older ones, using boolean true is safer generally but user asked for "new" so sticking to their logic if possible, but boolean is safer for types. I will use true for compatibility.
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
