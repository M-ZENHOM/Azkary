#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "..", "package.json");

function updateVersion(type = "patch") {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const currentVersion = packageJson.version;
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    let newVersion;
    switch (type) {
      case "major":
        newVersion = `${major + 1}.0.0`;
        break;
      case "minor":
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case "patch":
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

    console.log(`Version updated from ${currentVersion} to ${newVersion}`);

    execSync(`git add package.json`);
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    execSync(`git tag v${newVersion}`);

    console.log(`Git tag v${newVersion} created`);
    console.log(`\nTo publish the release:`);
    console.log(`1. Push the changes: git push origin main`);
    console.log(`2. Push the tag: git push origin v${newVersion}`);
    console.log(
      `3. The GitHub Action will automatically build and create a release`
    );
  } catch (error) {
    console.error("Error updating version:", error.message);
    process.exit(1);
  }
}

const type = process.argv[2] || "patch";
if (!["major", "minor", "patch"].includes(type)) {
  console.error("Invalid version type. Use: major, minor, or patch");
  process.exit(1);
}

updateVersion(type);
