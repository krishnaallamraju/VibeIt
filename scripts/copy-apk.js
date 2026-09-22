const fs = require('fs');
const path = require('path');

const srcApk = path.join(__dirname, '../client/android/app/build/outputs/apk/debug/app-debug.apk');
const destApk = path.join(__dirname, '../VibeIt.apk');

if (!fs.existsSync(srcApk)) {
  console.error('❌ Source APK not found at:', srcApk);
  process.exit(1);
}

fs.copyFileSync(srcApk, destApk);
const stats = fs.statSync(destApk);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n======================================================');
console.log('✅ Android APK built and copied successfully!');
console.log(`📦 Destination: ${destApk}`);
console.log(`📊 File Size:   ${sizeMb} MB (${stats.size.toLocaleString()} bytes)`);
console.log('======================================================\n');
