#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Get version from package.json (single source of truth)
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const version = packageJson.version;

console.log(`Syncing version ${version} across all files...`);

// Update Cargo.toml
const cargoPath = join('src-tauri', 'Cargo.toml');
let cargoContent = readFileSync(cargoPath, 'utf8');
cargoContent = cargoContent.replace(
  /^version = ".*"$/m,
  `version = "${version}"`
);
writeFileSync(cargoPath, cargoContent);
console.log(`✓ Updated ${cargoPath}`);

// Update tauri.conf.json
const tauriConfPath = join('src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log(`✓ Updated ${tauriConfPath}`);

console.log('✓ Version sync complete!');