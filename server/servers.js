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
    // app.use(express.static(__dirname + '/public'));
    // app.use(helmet());
    
	// Do not expose the internal server to the outside world.
    const server = app.listen(0, 'localhost');
    // console.log("Worker listening...");    
	const io = socketio(server);

	// Tell Socket.IO to use the redis adapter. By default, the redis
	// server is assumed to be on localhost:6379. You don't have to
	// specify them explicitly unless you want to change them.
	// redis-cli monitor
	io.adapter(io_redis({ host: 'localhost', port: 6379 }));

    // Here you might use Socket.IO middleware for authorization etc.
	// on connection, send the socket over to our module with socket stuff
    io.on('connection', function(socket) {
		socketMain(io,socket);
		console.log(`connected to worker: ${cluster.worker.id}`);
    });

	// Listen to messages sent from the master. Ignore everything else.
	process.on('message', function(message, connection) {
		if (message !== 'sticky-session:connection') {
			return;
		}

		// Emulate a connection event on the server by emitting the
		// event with the connection the master sent us.
		server.emit('connection', connection);

		connection.resume();
	});
}
