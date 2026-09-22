const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const androidDir = path.join(clientDir, 'android');
const srcAssets = path.join(androidDir, 'app', 'src', 'main', 'assets');
const tempAssets = path.join(os.tmpdir(), 'vibeit-assets');
const candidateApks = [
  path.join(os.tmpdir(), 'vibeit-gradle-build', 'app', 'outputs', 'apk', 'debug', 'app-debug.apk'),
  path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
];
const rootApk = path.join(rootDir, 'VibeItzzz.apk');
const rootApkLegacy = path.join(rootDir, 'VibeIt.apk');

console.log('🚀 [1/5] Exporting Expo web bundle...');
execSync('npx expo export --platform web', { cwd: clientDir, stdio: 'inherit' });

console.log('\n📲 [2/5] Syncing Capacitor Android plugins & assets...');
execSync('npx cap sync android', { cwd: clientDir, stdio: 'inherit' });

console.log('\n📂 [3/5] Syncing assets to build location...');
if (fs.existsSync(tempAssets)) {
  fs.rmSync(tempAssets, { recursive: true, force: true });
}
fs.cpSync(srcAssets, tempAssets, { recursive: true });

console.log('\n🔨 [4/5] Compiling Android APK with Gradle...');
const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat assembleDebug' : './gradlew assembleDebug';
execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });

console.log('\n📦 [5/5] Packaging and copying VibeItzzz.apk to project root...');
let foundApk = candidateApks.find(p => fs.existsSync(p));
if (!foundApk) {
  console.error('❌ Error: Compiled APK not found in candidates:', candidateApks);
  process.exit(1);
}

// Copy to both VibeItzzz.apk and VibeIt.apk
fs.copyFileSync(foundApk, rootApk);
fs.copyFileSync(foundApk, rootApkLegacy);

const publicDir = path.join(clientDir, 'public');
const distDir = path.join(clientDir, 'dist');
if (fs.existsSync(publicDir)) {
  fs.copyFileSync(foundApk, path.join(publicDir, 'VibeItzzz.apk'));
  fs.copyFileSync(foundApk, path.join(publicDir, 'VibeIt.apk'));
}
if (fs.existsSync(distDir)) {
  fs.copyFileSync(foundApk, path.join(distDir, 'VibeItzzz.apk'));
  fs.copyFileSync(foundApk, path.join(distDir, 'VibeIt.apk'));
}

const stats = fs.statSync(rootApk);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n======================================================');
console.log('🎉 VibeItzzz Android APK successfully generated!');
console.log(`📱 APK Path:  ${rootApk}`);
console.log(`📊 APK Size:  ${sizeMb} MB (${stats.size.toLocaleString()} bytes)`);
console.log('🌐 Server download endpoint ready at: /download-apk');
console.log('======================================================\n');
