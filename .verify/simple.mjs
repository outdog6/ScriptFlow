import { chromium } from "playwright";
import { join } from "path";

const DIR = join(import.meta.dirname, "screenshots");
const URL = "http://localhost:3005";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Collect ALL console output
const consoleLogs = [];
page.on("console", (msg) => {
  consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
});
page.on("pageerror", (err) => {
  consoleLogs.push(`[PAGE_ERROR] ${err.message}`);
});

// Track failed requests
const failedReqs = [];
page.on("requestfailed", (r) => {
  failedReqs.push({ url: r.url(), error: r.failure()?.errorText });
});

// 1. Clear first-visit flag FIRST, then navigate
await page.goto(URL, { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.removeItem("scriptflow-cinematic-visited"));

// 2. Navigate fresh - the page should load with lamp off
await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
console.log("Page loaded");

// 3. Wait for React to hydrate (data-cinematic attribute)
try {
  await page.waitForFunction(
    () => document.documentElement.hasAttribute("data-cinematic"),
    { timeout: 15000 }
  );
  console.log("✅ React hydrated: data-cinematic is set");
} catch (e) {
  console.log("❌ React did NOT hydrate in 15s");
}

await page.waitForTimeout(1000);

// 4. Check state
const state = await page.evaluate(() => ({
  dataCinematic: document.documentElement.hasAttribute("data-cinematic"),
  darkClass: document.documentElement.classList.contains("dark"),
  bodyText: document.body.innerText.slice(0, 400),
}));
console.log("State:", JSON.stringify(state, null, 2));

// 5. Take screenshot
await page.screenshot({ path: join(DIR, "fresh-load.jpg"), type: "jpeg", fullPage: false });
console.log("Screenshot: fresh-load.jpg");

// 6. Click chain ring
try {
  const svg = page.locator("svg").first();
  await svg.click({ position: { x: 225, y: 78 } });
  console.log("Clicked chain at (225, 78)");
} catch (e) {
  console.log("Click failed:", e.message);
}

// 7. Wait for animation
await page.waitForTimeout(4000);

// 8. Check post-click state
const postState = await page.evaluate(() => {
  const circles = document.querySelectorAll("svg circle");
  const bulbCircles = [];
  circles.forEach((c) => {
    const r = parseFloat(c.getAttribute("r") || "0");
    if (r >= 7 && r <= 12) {
      bulbCircles.push({ r, fill: c.getAttribute("fill")?.slice(0, 40) });
    }
  });
  return {
    text: document.body.innerText.slice(0, 400),
    bulbCircles,
    hasCineClass: !!document.querySelector(".cine-page"),
  };
});
console.log("Post-click:", JSON.stringify(postState, null, 2));

await page.screenshot({ path: join(DIR, "after-click.jpg"), type: "jpeg", fullPage: false });
console.log("Screenshot: after-click.jpg");

// 9. Console errors
const errors = consoleLogs.filter((l) => l.includes("ERROR") || l.includes("error"));
const warnings = consoleLogs.filter((l) => l.includes("warn"));
console.log("\n--- Console Summary ---");
console.log("Errors:", errors.length);
console.log("Warnings:", warnings.length);
if (failedReqs.length > 0) {
  console.log("Failed requests:", failedReqs);
}

await browser.close();
console.log("Done");
