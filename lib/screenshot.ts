import core from "puppeteer-core";
// @ts-ignore
import chromium from "@sparticuz/chromium-min";
import path from "path";
import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";

// URL for the Chromium Layer which includes the 'lib' folder with necessary shared libraries (libnss3, etc.)
const CHROMIUM_LAYER_URL = "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-layer.zip";

async function downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            // Handle Redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                if (!response.headers.location) {
                    reject(new Error("Redirect location missing"));
                    return;
                }
                // Recursively follow the redirect
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
            // Only unlink if the file was actually created (which happens on 200)
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
                if (fs.existsSync(chromiumPath)) {
                    fs.chmodSync(chromiumPath, 0o755);
                }
            } else {
                console.log("Chromium found in /tmp, skipping download.");
            }

            // DEBUG: List files to verify structure
            console.log("Files in extractDir:", fs.readdirSync(extractDir));
            if (fs.existsSync(libDir)) {
                console.log("Files in libDir:", fs.readdirSync(libDir));
            } else {
                console.log("libDir does not exist:", libDir);
            }

            // 6. Set LD_LIBRARY_PATH to include the extracted 'lib' folder
            const currentLibraryPath = process.env.LD_LIBRARY_PATH || "";
            const newLibraryPath = `${libDir}:${extractDir}:${currentLibraryPath}`;
            process.env.LD_LIBRARY_PATH = newLibraryPath;
            console.log(`LD_LIBRARY_PATH set to: ${newLibraryPath}`);

            browser = await core.launch({
                args: [
                    ...chromium.args,
                    "--hide-scrollbars",
                    "--disable-web-security",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    `--disable-gpu`,
                    `--no-zygote`,
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: chromiumPath,
                headless: chromium.headless as boolean | "shell",
                env: {
                    ...process.env,
                    LD_LIBRARY_PATH: newLibraryPath
                }
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
