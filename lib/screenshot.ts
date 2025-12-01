import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME_EXECUTABLE =
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        if (process.env.NODE_ENV === "development" || process.platform === "win32") {
            browser = await puppeteer.launch({
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                executablePath: LOCAL_CHROME_EXECUTABLE, // Adjust for your local machine
                headless: true,
            });
        } else {
            // Vercel / AWS Lambda config
            chromium.setGraphicsMode = false;
            await chromium.font(
                "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/aws-lambda-fonts.tar"
            );
            browser = await puppeteer.launch({
                args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(
                    "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar"
                ),
                headless: chromium.headless,
                // @ts-ignore
                ignoreHTTPSErrors: true,
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
        // Throw the actual error message for debugging
        throw new Error(`Screenshot failed: ${error.message || error}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
