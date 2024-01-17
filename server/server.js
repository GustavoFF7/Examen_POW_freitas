const io = require('socket.io')(3000, { // el puerto donde se ubica el server
    cors: {
        origin: ['http://localhost:5173' , 'http://172.16.5.4:5173', 'http://127.0.0.1:5173']        // origen de donde se conectan los clients
    }
})


io.on('connection', socket=> {
    console.log(socket.id) // cada vez que hay connection, se imprime el id
    socket.on('send-message', (message, room) => { //mensaje cuando sucede el evento "send-message"
        // el servidor al recibir el mensaje, responde a todos emitiendo su propio evento
        // io.emit('receive-message', message) 

        // el servidor al recibir el mensaje, responde a todos menos al que lo envio 
        // emitiendo su propio evento
        if (room === "") { // si esta en una room, envia el mensaje a esa room
            socket.broadcast.emit('receive-message', message) // sino mandalo a todos
        } else {
            socket.to(room).emit('receive-message', message)
        }
    })
    socket.on('join-room', room => {
        socket.join(room) // si recibe el evento join-room, se una a una room
    })
})