const mongoose = require('mongoose');
mongoose.connect('127.0.0.1/perfData', {
    useNewUrlParser: true
});
const Machine = require('./models/Machine');

function socketMain(io, socket){
    let macA;

    // console.log('A socket connected ', socket.id);
    socket.on('perfData', (key) => {
        if(key === 'abcdefg1234567'){
            // Valid nodeClient
            socket.join('clients');
        } else if (key = 'lkjhgf765432'){
            // Valid UI client has joined
            socket.join('ui')
        } else {
            // An invalid client has joined, immediately remove
            socket.disconnect(true);
        }
    });

    socket.on('initPerfData', (data) => {
        // console.log(data);
        // Updates the socket connect function scoped variable
        macA = data.macA;

        // Check mongo
        checkAndAdd(data);
    });

    socket.on('perfData', (data) => {
        console.log(data);
    });
}

function checkAndAdd(data){
    // JS will not wait for the db so function needs to be a promise
    return new Promise((resolve, reject) => {

    });
}

module.exports = socketMain;
