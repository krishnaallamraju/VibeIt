const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const apkFile = path.join(rootDir, 'VibeIt.apk');
const adbExe = path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools', 'adb.exe');

if (!fs.existsSync(apkFile)) {
  console.error('❌ VibeIt.apk not found in project root. Run npm run build:apk first.');
  process.exit(1);
}

if (!fs.existsSync(adbExe)) {
  console.error('❌ ADB executable not found at:', adbExe);
  process.exit(1);
}

console.log('🔍 Checking connected Android devices via ADB...');
const devicesOutput = execSync(`"${adbExe}" devices`, { encoding: 'utf8' });
console.log(devicesOutput.trim());

const lines = devicesOutput.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('List of devices'));

if (lines.length === 0) {
  console.log('\n⚠️ No phone detected via USB debugging.');
  console.log('\nTo connect your phone:');
  console.log(' 1. Connect your Android phone to this PC via USB cable.');
  console.log(' 2. On your phone: Settings > Developer Options > Enable "USB Debugging".');
  console.log(' 3. Run: npm run install:apk\n');
  console.log('Alternatively, you can install directly on your phone without USB:');
  console.log(' - Run `npm run dev:server` on your PC');
  console.log(' - Open Chrome on your phone and go to: http://10.188.203.113:4000/download-apk');
  process.exit(0);
}

console.log(`\n📲 Installing ${apkFile} onto connected device...`);
try {
  execSync(`"${adbExe}" install -r "${apkFile}"`, { stdio: 'inherit' });
  console.log('\n🎉 Successfully installed VibeIt.apk on your Android device!');
} catch (err) {
  console.error('❌ Installation failed:', err.message);
}
