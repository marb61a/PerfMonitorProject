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
}
