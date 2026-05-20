const fs = require("fs");
const path = require("path");

const devTypesDir = path.join(process.cwd(), ".next", "dev");

try {
  fs.rmSync(devTypesDir, { recursive: true, force: true });
} catch (error) {
  // Ignore cleanup errors so builds still proceed.
}
