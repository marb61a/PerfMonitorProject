// Captures local performance data + sends to the socket.io server
const os = require('os');
const { resolve } = require('path');

function performanceData() {
    const cpus = os.cpus();

    // What OS is being used
    const osType = os.type();

    // How long the system has been up
    const upTime = os.uptime();

    // How much memory is being used and is available on the system
    const freeMem = os.freemem();
    const totalMem = os.totalmem();

    const usedMem = totalMem - freeMem;
    const memUsage = Math.floor(usedMem / totalMem * 100) / 100;

    // CPU information (Per core)
    const cpuModel = cpus[0].model;
    const cpuSpeed = cpus[0].speed;
    const numCores = cpus.length;

    const cpuLoad = getCpuLoad();

    // console.log(osType);
    // console.log(upTime);
    // console.log(freeMem);
    // console.log(totalMem);
    // console.log(memUsage);
    // console.log(cpuModel);
    // console.log(cpuSpeed);
    // console.log(numCores);
}

// CPU covers all cores, getting the average of all cores
// will give the CPU average
function cpuAverage(){
    // Needed in the method to refresh data each time method is called
    const cpus = os.cpus();

    // Get milliseconds in each mode (since reboot)
    // get the number immediately and after 100ms to compare 
    let idleMs = 0;
    let totalMs = 0;

    // Loop through each core
    cpus.forEach((aCore) => {
        // Loops through the each of the properties of the current core
        for(type in aCore.times){
            // console.log(type);
            totalMs += aCore.times[os.type];

            idleMs =+ aCore.times.idle;
        }
    });

    return{
        idle: idleMs / cpus.length,
        total: totalMs / cpus.length
    }
}

// Times property is time since boot, we will get both the times
// for now and 100ms from now. Comparing them will give the current load
function getCpuLoad(){
    return new Promise((resolve, reject) => {
        const start = cpuAverage();

        setTimeout(() => {
            const end = cpuAverage();
            const idleDifference = end.idle - start.idle;
            const totalDifference = end.total - start.total;

            // Calculate the % of used CPU
            const percentCpu = 100 - Math.floor(100 * idleDifference / totalDifference);
            resolve(percentCpu);
        }, 100);
    })
    
}
