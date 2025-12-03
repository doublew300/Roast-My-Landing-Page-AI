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

                // 4. Find al2023.tar.br
                const tarBrPath = findEntry(extractDir, "al2023.tar.br");
                if (!tarBrPath) {
                    throw new Error("Could not find al2023.tar.br in extracted layer!");
                }
                console.log("Found al2023.tar.br at:", tarBrPath);

                // 5. Decompress Brotli (.br -> .tar)
                const tarPath = path.join(extractDir, "chromium.tar");
                console.log("Decompressing Brotli...");
                const brotliData = fs.readFileSync(tarBrPath);
                const tarData = zlib.brotliDecompressSync(brotliData);
                fs.writeFileSync(tarPath, tarData);

                // 6. Extract Tar (.tar -> files)
                console.log("Extracting Tar...");
                // Use node-tar to extract
                await tar.x({
                    file: tarPath,
                    cwd: extractDir
                });
                fs.unlinkSync(tarPath);

                // 7. Verify Binary
                if (!fs.existsSync(finalChromiumPath)) {
                    // Try to find it if it's nested
                    const found = findEntry(extractDir, "chromium");
                    if (found) {
                        // Move it to expected location or update path
                        if (fs.statSync(found).isDirectory()) {
                            // If it's a directory, look for the executable inside
                            let executable;

                            // 1. Try to find binary via package.json
                            const packageJsonPath = path.join(found, "package.json");
                            if (fs.existsSync(packageJsonPath)) {
                                try {
                                    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
                                    if (pkg.bin) {
                                        let binPath;
                                        if (typeof pkg.bin === "string") {
                                            binPath = pkg.bin;
                                        } else if (typeof pkg.bin === "object") {
                                            binPath = pkg.bin.chromium || pkg.bin.chrome || pkg.bin["chromium-browser"] || Object.values(pkg.bin)[0];
                                        }

                                        if (binPath) {
                                            const possiblePath = path.join(found, binPath);
                                            if (fs.existsSync(possiblePath) && !fs.statSync(possiblePath).isDirectory()) {
                                                executable = possiblePath;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error("Failed to parse package.json:", e);
                                }
                            }

                            // 2. Try standard names if package.json failed
                            if (!executable) executable = findEntry(found, "chromium");
                            if (!executable) executable = findEntry(found, "chrome");
                            if (!executable) executable = findEntry(found, "chromium-browser");
                            if (!executable) executable = findEntry(found, "headless_shell");

                            if (executable && !fs.statSync(executable).isDirectory()) {
                                fs.renameSync(executable, finalChromiumPath);
                            } else {
                                // List files in the directory for debugging
                                const files = fs.readdirSync(found);
                                let binFiles: string[] = [];
                                const binDir = path.join(found, "bin");
                                if (fs.existsSync(binDir) && fs.statSync(binDir).isDirectory()) {
                                    binFiles = fs.readdirSync(binDir).map(f => `bin/${f}`);
                                }

                                console.log("Files in chromium dir:", files);
                                if (binFiles.length > 0) console.log("Files in bin dir:", binFiles);

                                throw new Error(`Chromium binary not found inside chromium directory! Contents: ${files.join(", ")}${binFiles.length ? ", " + binFiles.join(", ") : ""}`);
                            }
                        } else {
                            fs.renameSync(found, finalChromiumPath);
                        }
                    } else {
                        throw new Error("Chromium binary not found after tar extraction!");
                    }
                }

                // Double check if finalChromiumPath is a directory
                if (fs.existsSync(finalChromiumPath) && fs.statSync(finalChromiumPath).isDirectory()) {
                    console.log("finalChromiumPath is a directory, looking for executable inside...");
                    const executable = findEntry(finalChromiumPath, "chromium");
                    if (executable && !fs.statSync(executable).isDirectory()) {
                        // Move executable to a temp path, remove dir, move back
                        const tempPath = path.join(extractDir, "chromium_temp");
                        fs.renameSync(executable, tempPath);
                        fs.rmSync(finalChromiumPath, { recursive: true, force: true });
                        fs.renameSync(tempPath, finalChromiumPath);
                    } else {
                        console.log("Contents of finalChromiumPath:", fs.readdirSync(finalChromiumPath));
                        throw new Error("finalChromiumPath is a directory and executable not found inside!");
                    }
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
