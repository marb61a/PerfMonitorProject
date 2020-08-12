function socketMain(io, socket){
    // console.log('A socket connected ', socket.id);
    socket.on('perfData', (key) => {
        if(key === 'abcdefg1234567'){
            // Valid nodeClient
            socket.join('clients');
        } else if (key = 'lkjhgf765432'){
            // Valid UI client has joined
            socket.join('ui')
        }
    });

    socket.on('perfData', (data) => {
        console.log(data);
    });
}

module.exports = socketMain;
