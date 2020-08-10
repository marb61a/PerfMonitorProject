// Socket.io server that serves both node and react clients
// Entry point for the cluster which will make workers which will handle Socket.io
//See https://github.com/elad/node-cluster-socket.io

const express = require('express');
const cluster = require('cluster');
const net = require('net');
const socketio = require('socket.io');
// const helmet = require('helmet')
const socketMain = require('./socketMain');
// const expressMain = require('./expressMain');

const port = 8181;
const num_processes = require('os').cpus().length;
const io_redis = require('socket.io-redis');
const farmhash = require('farmhash');

if(cluster.isMaster){
    // Stores workers, they are needed to be able to reference them on source IP address
    let workers = [];

    // Helper function for spawning worker at index 'i'.
    let spawn = function(i){
        workers[i] = cluster.fork();

        // Optional: Restart worker on exit
        workers[i].on('exit', function(code, signal) {
			// console.log('respawning worker', i);
			spawn(i);
		});
    }

    // Spawn workers
    for(var i = 0; i < num_processes; i++){
        spawn(i);
    }

    // A helper function for getting a worker index based on an IP address
    // It works by converting the IP address to a number and compressing to the number of slots available
    const worker_index = function(ip, len){
        // Farmhash is very quickand also works with IPv6
        return farmhash.fingerprint32(ip) % len;
    }

    // Starting a TCP connection with the net module instead of the http module
    // There needs to be an independent port open for cluster to work. This is 
    // the internet facing port
    const server = net.createServer({pauseOnConnect: true}, (connection) => {
        // Connection has been recieved and must be passed to the appropriate worker
        // Get the worker for the connection's source IP and pass the connection
        let worker = workers[worker_index(connection.remoteAddress, num_processes)];
		worker.send('sticky-session:connection', connection);
    });

    server.listen(port);
    console.log(`Master listening on port ${port}`);
} else {
    // No need to listen for a port here as the master does it
    let app = express();
    
}
