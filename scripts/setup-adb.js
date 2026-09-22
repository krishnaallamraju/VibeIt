const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const platformToolsDir = path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools');
const adbExe = path.join(platformToolsDir, 'adb.exe');

if (!fs.existsSync(adbExe)) {
  console.error('❌ ADB executable not found at:', adbExe);
  process.exit(1);
}

console.log('✅ Found ADB at:', adbExe);

// Add to Windows User PATH permanently
try {
  const currentPath = execSync('powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable(\'Path\', \'User\')"', { encoding: 'utf8' }).trim();
  if (!currentPath.includes(platformToolsDir)) {
    const newPath = currentPath ? `${currentPath.replace(/;+$/, '')};${platformToolsDir}` : platformToolsDir;
    // Set user environment variable
    execSync(`powershell -NoProfile -Command "[Environment]::SetEnvironmentVariable('Path', '${newPath.replace(/'/g, "''")}', 'User')"`);
    console.log('🎉 Successfully added platform-tools to User PATH permanently!');
  } else {
    console.log('ℹ️ platform-tools is already in User PATH.');
  }
} catch (err) {
  console.warn('⚠️ Could not update permanent User PATH:', err.message);
}

// Check devices
console.log('\n📱 Checking connected Android devices:');
try {
  const devices = execSync(`"${adbExe}" devices`, { encoding: 'utf8' });
  console.log(devices.trim());
} catch (e) {
  console.warn(e.message);
}
