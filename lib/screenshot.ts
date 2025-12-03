import core from "puppeteer-core";
import path from "path";
import fs from "fs";
import https from "https";
import AdmZip from "adm-zip";
import zlib from "zlib";
import * as tar from "tar";

// URL for the Chromium Layer (contains al2023.tar.br)
const CHROMIUM_LAYER_URL = "https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-layer.zip";

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

// Helper to recursively find a file
function findEntry(startDir: string, name: string): string | null {
    if (!fs.existsSync(startDir)) return null;
    const files = fs.readdirSync(startDir);
    for (const file of files) {
        const fullPath = path.join(startDir, file);
        const stat = fs.statSync(fullPath);
        if (file === name) return fullPath;
        if (stat.isDirectory()) {
            const result = findEntry(fullPath, name);
            if (result) return result;
        }
    }
    return null;
}

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;
    try {
        if (process.env.VERCEL) {
            console.log("Running on Vercel (AL2023 Strategy)...");
            const tmpDir = "/tmp";
            const zipPath = path.join(tmpDir, "chromium-layer.zip");
            const extractDir = path.join(tmpDir, "chromium-layer");
            const finalChromiumPath = path.join(extractDir, "chromium");

            // 1. Check if already ready
            if (!fs.existsSync(finalChromiumPath)) {
                console.log("Chromium not found, starting setup...");

                // Cleanup
                if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
                fs.mkdirSync(extractDir, { recursive: true });

                // 2. Download Layer Zip
                console.log("Downloading layer...");
                await downloadFile(CHROMIUM_LAYER_URL, zipPath);

                // 3. Extract Layer Zip
                console.log("Extracting layer zip...");
                const zip = new AdmZip(zipPath);
                zip.extractAllTo(extractDir, true);
                fs.unlinkSync(zipPath);

                // 4. Find chromium.br
                const chromiumBrPath = findEntry(extractDir, "chromium.br");
                if (!chromiumBrPath) {
                    // Fallback to al2023.tar.br if chromium.br not found (legacy support)
                    const tarBrPath = findEntry(extractDir, "al2023.tar.br");
                    if (!tarBrPath) {
                        const files = fs.readdirSync(extractDir);
                        let binFiles: string[] = [];
                        const binDir = path.join(extractDir, "bin");
                        if (fs.existsSync(binDir) && fs.statSync(binDir).isDirectory()) {
                            binFiles = fs.readdirSync(binDir).map(f => `bin/${f}`);
                        }
                        throw new Error(`Could not find chromium.br or al2023.tar.br! Contents: ${files.join(", ")}${binFiles.length ? ", " + binFiles.join(", ") : ""}`);
                    }

                    console.log("Found al2023.tar.br at:", tarBrPath);
                    throw new Error("Unexpected: chromium.br not found but al2023.tar.br is present. Please report this.");
                }

                console.log("Found chromium.br at:", chromiumBrPath);

                // 5. Decompress Brotli directly to final executable
                console.log("Decompressing chromium.br...");
                const brotliData = fs.readFileSync(chromiumBrPath);
                const decompressedData = zlib.brotliDecompressSync(brotliData);
                fs.writeFileSync(finalChromiumPath, decompressedData);

                // 6. Verify and chmod
                if (!fs.existsSync(finalChromiumPath)) {
                    throw new Error("Chromium binary not found after decompression!");
                }

                fs.chmodSync(finalChromiumPath, 0o755);
                console.log("Chromium setup complete at:", finalChromiumPath);
            }

            browser = await core.launch({
                executablePath: finalChromiumPath,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-zygote",
                    "--single-process",
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
