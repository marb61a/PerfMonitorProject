const mongoose = require('mongoose');
mongoose.connect('127.0.0.1/perfData', {
    useNewUrlParser: true
});

function socketMain(io, socket){
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

    socket.on('perfData', (data) => {
        console.log(data);
    });
}

module.exports = socketMain;
