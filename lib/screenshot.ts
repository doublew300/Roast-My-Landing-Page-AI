import puppeteer from "puppeteer";

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ],
            // In Docker, we can use the installed google-chrome-stable or let Puppeteer download its own.
            // Since we installed google-chrome-stable in Dockerfile, we can point to it if needed,
            // but standard Puppeteer usually handles its own cache.
            // For simplicity and reliability in this specific Docker setup, we'll let Puppeteer use its bundled version
            // which is guaranteed to match the API.
        });

        const page = await browser.newPage();

        // Set a real User Agent
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        await page.setViewport({ width: 1200, height: 630 });

        // Wait until network is idle (no active connections for at least 500ms) to ensure images load
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

        // Wait a bit for animations
        await new Promise(r => setTimeout(r, 2000));

        const file = await page.screenshot({ type: "png" });
        return file as Buffer;

    } catch (error) {
        console.error("Browser Error:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
