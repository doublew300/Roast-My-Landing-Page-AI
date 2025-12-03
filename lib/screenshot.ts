import core from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

// Ссылка на ВЕРСИЮ 110 (Самая стабильная для Vercel)
const CHROMIUM_URL = "https://github.com/Sparticuz/chromium/releases/download/v110.0.1/chromium-v110.0.1-pack.tar";

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        // Настройка запуска
        const launchOptions = {
            args: [
                ...chromium.args,
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ],
            defaultViewport: chromium.defaultViewport,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        };

        if (process.env.VERCEL) {
            // === VERCEL ===
            // Скачиваем браузер v110
            const executablePath = await chromium.executablePath(CHROMIUM_URL);

            browser = await core.launch({
                ...launchOptions,
                executablePath: executablePath,
            });
        } else {
            // === LOCALHOST ===
            const puppeteer = await import("puppeteer").then(m => m.default);
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox"],
            });
        }

        const page = await browser.newPage();

        // Устанавливаем реальный User Agent (чтобы сайты не блокировали)
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36");

        await page.setViewport({ width: 1200, height: 630 });

        // Таймаут 25 секунд (на скачивание + загрузку)
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });

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
