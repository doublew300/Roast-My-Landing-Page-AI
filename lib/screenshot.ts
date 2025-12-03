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

// Helper to recursively find a file or directory
function findEntry(startDir: string, name: string, type: 'file' | 'directory' = 'file'): string | null {
    if (!fs.existsSync(startDir)) return null;
    const files = fs.readdirSync(startDir);
    for (const file of files) {
        const fullPath = path.join(startDir, file);
        const stat = fs.statSync(fullPath);

        if (file === name) {
            if (type === 'file' && stat.isFile()) return fullPath;
            if (type === 'directory' && stat.isDirectory()) return fullPath;
        }

        if (stat.isDirectory()) {
            const result = findEntry(fullPath, name, type);
            if (result) return result;
        }
    }
    return null;
}

// Helper to list all files recursively for debugging
function listAllFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            listAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

export async function captureScreenshot(url: string): Promise<Buffer> {
    let browser;

    try {
        if (process.env.VERCEL) {
            console.log("Running on Vercel...");

            const tmpDir = "/tmp";
            const zipPath = path.join(tmpDir, "chromium-layer.zip");
            const extractDir = path.join(tmpDir, "chromium-layer");

            // 1. Download & Extract if needed
            // We force a check for the 'chromium' binary to decide if we need to re-download
            let chromiumPath = findEntry(extractDir, "chromium", 'file');

            if (!chromiumPath) {
                console.log("Chromium binary not found, starting download/extraction...");

                // Clean up any partial state
                if (fs.existsSync(extractDir)) {
                    fs.rmSync(extractDir, { recursive: true, force: true });
                }

                await downloadFile(CHROMIUM_LAYER_URL, zipPath);
                console.log("Download complete. Extracting...");

                const zip = new AdmZip(zipPath);
                zip.extractAllTo(extractDir, true);
                console.log("Extraction complete.");

                fs.unlinkSync(zipPath);
            } else {
                console.log("Chromium found at:", chromiumPath);
            }

            // 2. Resolve Paths Dynamically
            chromiumPath = findEntry(extractDir, "chromium", 'file');
            const libDir = findEntry(extractDir, "lib", 'directory'); // Look for 'lib' folder

            if (!chromiumPath) {
                const allFiles = listAllFiles(extractDir);
                throw new Error(`Chromium binary NOT found! Files in ${extractDir}: ${JSON.stringify(allFiles, null, 2)}`);
            }

            // Make executable
            fs.chmodSync(chromiumPath, 0o755);

            // 3. Configure Environment
            let launchEnv = { ...process.env };
            if (libDir) {
                console.log("Library directory found at:", libDir);
                const currentLibraryPath = process.env.LD_LIBRARY_PATH || "";
                const newLibraryPath = `${libDir}:${currentLibraryPath}`;
                process.env.LD_LIBRARY_PATH = newLibraryPath;
                launchEnv.LD_LIBRARY_PATH = newLibraryPath;
                console.log("LD_LIBRARY_PATH set to:", newLibraryPath);
            } else {
                console.warn("WARNING: 'lib' directory not found! libnss3 error may persist.");
            }

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
                env: launchEnv
            });

        } else {
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
