// build.js
const { execSync } = require("child_process");

try {
  console.log("Installing devDependencies...");
  execSync("npm install", { stdio: "inherit" });

  console.log("Building with Vite...");
  execSync("npx vite build", { stdio: "inherit" });

  console.log("Build complete ✅");
} catch (err) {
  console.error("Build failed ❌", err);
  process.exit(1);
}
