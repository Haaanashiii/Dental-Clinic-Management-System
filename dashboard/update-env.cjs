// Auto-detect local IP and update .env for VITE_API_BASE_URL
const os = require('os');
const fs = require('fs');
const path = require('path');

const interfaces = os.networkInterfaces();
let localIp = 'localhost';
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIp = iface.address;
      break;
    }
  }
  if (localIp !== 'localhost') break;
}

const envPath = path.join(__dirname, '.env');
const envContent = `VITE_API_BASE_URL=http://${localIp}:5137\n`;
fs.writeFileSync(envPath, envContent);
console.log(`.env updated: VITE_API_BASE_URL=http://${localIp}:5137`);
