import core from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import path from "path";
import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";

// URL for the Chromium Layer which includes the 'lib' folder with necessary shared libraries (libnss3, etc.)
const CHROMIUM_LAYER_URL = "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-layer.zip";

async function downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => { });
            reject(err);
        });
    });
}

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;

    try {
        if (process.env.VERCEL) {
            // === VERCEL CONFIGURATION ===
            console.log("Running on Vercel...");

            const tmpDir = "/tmp";
            const zipPath = path.join(tmpDir, "chromium-layer.zip");
            const extractDir = path.join(tmpDir, "chromium-layer");
            const libDir = path.join(extractDir, "lib");
            const chromiumPath = path.join(extractDir, "chromium");

            // 1. Check if already extracted
            if (!fs.existsSync(chromiumPath) || !fs.existsSync(libDir)) {
                console.log("Chromium not found in /tmp, downloading layer...");

                // 2. Download the Layer Zip
                await downloadFile(CHROMIUM_LAYER_URL, zipPath);
                console.log("Download complete. Extracting...");

                // 3. Extract the Zip
                const zip = new AdmZip(zipPath);
                zip.extractAllTo(extractDir, true);
                console.log("Extraction complete.");

                // 4. Cleanup Zip
                fs.unlinkSync(zipPath);

                // 5. Make binary executable
                fs.chmodSync(chromiumPath, 0o755);
            } else {
                console.log("Chromium found in /tmp, skipping download.");
            }

            // 6. Set LD_LIBRARY_PATH to include the extracted 'lib' folder
            // This is the CRITICAL fix for "error while loading shared libraries: libnss3.so"
            const currentLibraryPath = process.env.LD_LIBRARY_PATH || "";
            process.env.LD_LIBRARY_PATH = `${libDir}:${extractDir}:${currentLibraryPath}`;
            console.log(`LD_LIBRARY_PATH set to: ${process.env.LD_LIBRARY_PATH}`);

            browser = await core.launch({
                args: [
                    ...chromium.args,
                    "--hide-scrollbars",
                    "--disable-web-security",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    // Explicitly point to the libraries if LD_LIBRARY_PATH fails (backup)
                    `--disable-gpu`,
                    `--no-zygote`,
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: chromiumPath,
                headless: chromium.headless as boolean | "shell",
                ignoreHTTPSErrors: true,
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
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
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
