import core from "puppeteer-core";
import path from "path";
import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";

// URL for Chrome for Testing (Headless Shell) - Linux x64
// Using a known stable version compatible with Puppeteer Core v24
const CHROME_URL = "https://storage.googleapis.com/chrome-for-testing-public/121.0.6167.85/linux64/chrome-headless-shell-linux64.zip";

async function downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                if (!response.headers.location) {
                    reject(new Error("Redirect location missing"));
                    return;
                }
                downloadFile(response.headers.location, destPath)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(destPath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
        request.on('error', (err) => {
            if (fs.existsSync(destPath)) {
                fs.unlink(destPath, () => { });
            }
            reject(err);
        });
    });
}

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        if (process.env.VERCEL) {
            console.log("Running on Vercel (Chrome for Testing)...");
            const tmpDir = "/tmp";
            const zipPath = path.join(tmpDir, "chrome-headless-shell.zip");
            const extractDir = path.join(tmpDir, "chrome-headless-shell");
            const binaryPath = path.join(extractDir, "chrome-headless-shell-linux64", "chrome-headless-shell");

            if (!fs.existsSync(binaryPath)) {
                console.log("Binary not found, downloading...");
                if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });

                await downloadFile(CHROME_URL, zipPath);
                console.log("Download complete. Extracting...");

                const zip = new AdmZip(zipPath);
                zip.extractAllTo(extractDir, true);
                console.log("Extraction complete.");
                fs.unlinkSync(zipPath);

                if (fs.existsSync(binaryPath)) {
                    fs.chmodSync(binaryPath, 0o755);
                } else {
                    throw new Error(`Binary not found at ${binaryPath}`);
                }
            }

            browser = await core.launch({
                executablePath: binaryPath,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-zygote",
                    "--single-process", // Often needed for serverless
                    "--hide-scrollbars",
                ],
                headless: "shell"
            });
        } else {
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
