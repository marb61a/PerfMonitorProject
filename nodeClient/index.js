// Captures local performance data + sends to the socket.io server
const os = require('os');
const io = require('socket.io-client');
// Will request a connection to the socket io server
let socket = io('http://127.0.0.1:8181');

socket.on('connect', () => {
    // console.log('Connected to socket server');
    
    // Need to id this machine to whomever is concerned
    const nI = os.networkInterfaces();
    let macA;

    // Loop through all network interfaces and find a non internal one
    // There will be at least 1 if the computer is to connect to the internet
    for(let key in nI){
        if(!nI[key][0].internal){
            macA = nI[key][0].mac;
            break;
        }
    }

    // Client authentication with single key value
    socket.emit('clientAuth', 'abcdefg1234567');

    performanceData().then((allPerformanceData) => {
        allPerformanceData.macA = macA;
        socket.emit('initPerfData', allPerformanceData);
    });

    // Start sending over data on interval
    let perfDataInterval = setInterval(() => {
        performanceData().then((allPerformanceData) => {
            // console.log(allPerformanceData);
            socket.emit('perfData', allPerformanceData);
        });
        
    }, 1000);

    socket.on('disconnect', () => {
        clearInterval(perfDataInterval);
    })
});

function performanceData() {
    return new Promise(async(resolve, reject) => {
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

        const cpuLoad = await getCpuLoad();
        resolve({
            freeMem, totalMem, usedMem, memUsage, osType, upTime, cpuModel, numCores, cpuSpeed, cpuLoad
        });

    });
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
            totalMs += aCore.times[type];

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
            const percentageCpu = 100 - Math.floor(100 * idleDifference / totalDifference);
            resolve(percentageCpu);
        }, 100);
    })
    
}
