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

            // 1. Download Layer Zip if not present or force clean setup
            // For robustness, we'll clean up and start fresh if things look weird, 
            // but to save time we check if we have a working binary.
            // However, since we are changing strategies, let's force a clean setup for this run.
            if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
            fs.mkdirSync(extractDir, { recursive: true });

            console.log("Downloading layer...");
            await downloadFile(CHROMIUM_LAYER_URL, zipPath);

            // 2. Extract Layer Zip
            console.log("Extracting layer zip...");
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractDir, true);
            fs.unlinkSync(zipPath);

            // 3. Find appropriate tarball (al2.tar.br or al2023.tar.br)
            // Vercel typically runs on Amazon Linux 2, so we prefer al2.tar.br if available.
            let tarBrPath = findEntry(extractDir, "al2.tar.br");
            if (!tarBrPath) {
                tarBrPath = findEntry(extractDir, "al2023.tar.br");
            }

            if (!tarBrPath) {
                const files = fs.readdirSync(extractDir);
                let binFiles: string[] = [];
                const binDir = path.join(extractDir, "bin");
                if (fs.existsSync(binDir) && fs.statSync(binDir).isDirectory()) {
                    binFiles = fs.readdirSync(binDir).map(f => `bin/${f}`);
                }
                throw new Error(`Could not find al2.tar.br or al2023.tar.br! Contents: ${files.join(", ")}${binFiles.length ? ", " + binFiles.join(", ") : ""}`);
            }

            console.log("Found tarball at:", tarBrPath);

            // 4. Decompress Brotli (.br -> .tar)
            const tarPath = path.join(extractDir, "chromium.tar");
            console.log("Decompressing Brotli...");
            const brotliData = fs.readFileSync(tarBrPath);
            const tarData = zlib.brotliDecompressSync(brotliData);
            fs.writeFileSync(tarPath, tarData);

            // 5. Extract Tar (.tar -> files)
            console.log("Extracting Tar...");
            await tar.x({
                file: tarPath,
                cwd: extractDir
            });
            fs.unlinkSync(tarPath);

            // 6. Find Binary and Libs
            let executablePath: string | null = null;
            let libPath: string | null = null;

            // Helper to find things in the extracted structure
            const findInExtracted = (dir: string) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (entry.name === "lib") {
                            libPath = fullPath;
                        }
                        // Recurse
                        findInExtracted(fullPath);
                    } else {
                        if (entry.name === "chromium" || entry.name === "chrome" || entry.name === "headless_shell") {
                            executablePath = fullPath;
                        }
                    }
                }
            };

            findInExtracted(extractDir);

            if (!executablePath) {
                // Try package.json strategy as fallback
                const packageJsonPath = findEntry(extractDir, "package.json");
                if (packageJsonPath) {
                    try {
                        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
                        if (pkg.bin) {
                            const binVal = typeof pkg.bin === "string" ? pkg.bin : Object.values(pkg.bin)[0];
                            if (typeof binVal === "string") {
                                executablePath = path.join(path.dirname(packageJsonPath), binVal);
                            }
                        }
                    } catch (e) { }
                }
            }

            if (!executablePath) {
                throw new Error("Chromium binary not found after extraction!");
            }

            // Ensure executable
            fs.chmodSync(executablePath, 0o755);
            console.log("Chromium binary found at:", executablePath);

            if (libPath) {
                console.log("Library path found at:", libPath);
            } else {
                console.log("No 'lib' directory found. System libraries will be used.");
            }

            browser = await core.launch({
                executablePath: executablePath,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--no-zygote",
                    "--single-process",
                    "--hide-scrollbars",
                ],
                env: {
                    ...process.env,
                    LD_LIBRARY_PATH: libPath ? `${libPath}:${process.env.LD_LIBRARY_PATH || ""}` : process.env.LD_LIBRARY_PATH
                },
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
