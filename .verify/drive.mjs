import { chromium } from "playwright";
import { join } from "path";

const SCREENSHOT_DIR = join(import.meta.dirname, "screenshots");
const URL = "http://localhost:3001";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[PAGE ERROR] ${err.message}`));

// 1. Clear first-visit flag to get full animation
await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.removeItem("scriptflow-cinematic-visited"));

// 2. Reload and check what renders
// Capture all failed network requests
const failedRequests = [];
page.on("requestfailed", (request) => {
  failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText}`);
});

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(3000);

console.log("Failed requests:");
failedRequests.forEach(r => console.log("  ", r));

// Diagnostic: dump HTML structure to find what's rendering
const htmlDiag = await page.evaluate(() => {
  return {
    dataCinematic: document.documentElement.hasAttribute("data-cinematic"),
    darkClass: document.documentElement.classList.contains("dark"),
    bodyClasses: document.body.className,
    bodyHTML: document.body.innerHTML.slice(0, 2000),
    allAttributes: Array.from(document.documentElement.attributes).map(a => a.name),
    reactErrors: Array.from(document.querySelectorAll('[data-nextjs-router-state]')).length,
    // Check for any error boundaries
    errorText: document.body.innerText.slice(0, 500),
  };
});
console.log("HTML diag:", JSON.stringify(htmlDiag, null, 2));

console.log("--- INITIAL STATE (first visit, lamp off) ---");
const body1 = await page.textContent("body");
console.log("Body:", body1?.slice(0, 350));

const hasHint = body1?.includes("拉我") ?? false;
const hasSvg = !!(await page.$("svg"));
console.log("SVG present:", hasSvg);
console.log("Has '拉我' hint:", hasHint);

await page.screenshot({ path: join(SCREENSHOT_DIR, "01-lamp-off.png"), fullPage: false });

// 3. Debug: inspect the SVG and chain area before clicking
const debugInfo = await page.evaluate(() => {
  const svg = document.querySelector("svg");
  if (!svg) return { error: "no svg" };
  const box = svg.getBoundingClientRect();
  const hasDataCinematic = document.documentElement.hasAttribute("data-cinematic");
  const hasDarkClass = document.documentElement.classList.contains("dark");
  // Check what's at chain position
  const cx = box.left + 225 * (box.width / 280);
  const cy = box.top + 78 * (box.height / 320);
  const el = document.elementFromPoint(cx, cy);
  return {
    svgBox: { x: box.x, y: box.y, w: box.width, h: box.height },
    dataCinematic: hasDataCinematic,
    darkClass: hasDarkClass,
    elementAtChain: el?.tagName || "null",
    elementAtChainClass: el?.getAttribute("class") || "",
    gsapLoaded: typeof window !== "undefined" && !!window.gsap,
  };
});
console.log("Debug:", JSON.stringify(debugInfo, null, 2));

// Click the chain ring
const lampSvg = page.locator("svg").first();
await lampSvg.click({ position: { x: 225, y: 78 } });
console.log("Chain click: Playwright click at SVG position (225, 78)");

// Check if state changed
await page.waitForTimeout(500);
const postClickState = await page.evaluate(() => {
  // Check lamp bulb fill
  const circles = document.querySelectorAll("svg circle");
  const states = Array.from(circles).slice(0, 5).map(c => ({
    r: c.getAttribute("r"),
    fill: c.getAttribute("fill")?.slice(0, 30) || "none"
  }));
  return states;
});
console.log("Post-click circle states:", JSON.stringify(postClickState));
// 4. Wait for animation (first-visit ritual ~2s)
await page.waitForTimeout(3500);

console.log("\n--- AFTER ANIMATION (lamp on, book open) ---");
const body2 = await page.textContent("body");
console.log("Body:", body2?.slice(0, 350));

const hasScriptFlow = body2?.includes("ScriptFlow") ?? false;
console.log("Has ScriptFlow:", hasScriptFlow);

// Check if lamp turned on (bulb glow should be visible)
const lampState = await page.evaluate(() => {
  const circles = document.querySelectorAll("svg circle");
  let on = false;
  circles.forEach((c) => {
    const fill = c.getAttribute("fill") || "";
    if (fill.includes("cine-bulb") || fill.includes("ffb") || fill.includes("ff8") || fill.includes("ffc")) {
      on = true;
    }
  });
  return on ? "lamp appears ON" : "lamp appears OFF";
});
console.log("Lamp state:", lampState);

await page.screenshot({ path: join(SCREENSHOT_DIR, "02-lamp-on.png"), fullPage: false });

// 5. Console check
console.log("\n--- CONSOLE ---");
const errors = logs.filter((l) => l.includes("ERROR") || (l.includes("error") && !l.includes("errors")));
if (errors.length) {
  console.log("ERRORS:", errors.join("\n"));
} else {
  console.log("No errors found");
}

await browser.close();
console.log("\nScreenshots:", SCREENSHOT_DIR);
