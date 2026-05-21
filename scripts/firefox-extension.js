const { existsSync, mkdirSync, rmSync, cpSync, unlinkSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const rootDir = join(__dirname, "..");
const buildDir = join(rootDir, "build");
const extensionDir = join(rootDir, "extension", "firefox");
const gameDir = join(extensionDir, "game");
const archivePath = join(rootDir, "extension", "greatest-game-firefox.zip");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

const ensureExtensionShell = () => {
  const manifestPath = join(extensionDir, "manifest.json");
  const backgroundPath = join(extensionDir, "background.js");

  if (!existsSync(manifestPath) || !existsSync(backgroundPath)) {
    throw new Error("Firefox extension shell is missing. Expected manifest.json and background.js.");
  }
};

const buildExtension = () => {
  ensureExtensionShell();
  run(npmCommand, ["run", "build"]);

  rmSync(gameDir, {
    recursive: true,
    force: true
  });
  mkdirSync(gameDir, {
    recursive: true
  });
  cpSync(buildDir, gameDir, {
    recursive: true
  });

  console.log(`Firefox extension game files copied to ${gameDir}`);
};

const packageExtension = () => {
  buildExtension();

  rmSync(archivePath, {
    force: true
  });

  const result = spawnSync("zip", ["-qr", archivePath, "."], {
    cwd: extensionDir,
    stdio: "inherit"
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new Error("The zip command is required to package the Firefox extension.");
    }

    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  console.log(`Firefox extension package created at ${archivePath}`);
};

const command = process.argv[2];

if (command === "build") {
  buildExtension();
} else if (command === "package") {
  packageExtension();
} else {
  console.error("Usage: node scripts/firefox-extension.js <build|package>");
  process.exit(1);
}
