// Captures local perfformance data + sends to the socket.io server
const os = require('os');

// What OS is being used
const osType = os.type();

// How long the system has been up
const upTime = os.uptime();

// How much memory is being used and is available on the system
const freeMem = os.freemem();
const totalMem = os.totalmem();

const usedMem = totalMem - freeMem;
const memUsage = Math.floor(usedMem / totalMem * 100);

console.log(osType);
console.log(upTime);
console.log(freeMem);
console.log(totalMem);
console.log(memUsage);
