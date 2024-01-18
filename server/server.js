const io = require('socket.io')(3000, { // el puerto donde se ubica el server
    cors: {
        origin: ['http://localhost:5173' , 'http://172.16.5.4:5173', 'http://127.0.0.1:5173']        // origen de donde se conectan los clients
    }
})

let hangman_ids = ["piso","palo","cuerda","cabeza","cuerpo","brazos","pies"]
let cont = 0;

let palabra = "paralelepipedo"
function checkLetra (letra) {
    if ( palabra.includes(letra)) {
        console.log("letra-correcta");
        let indices = getLetraIndex(letra)
        io.emit('letra-correcta', indices , letra)    
    } else {
        console.log("letra-erronea");
        if (cont < 7) {
            io.emit('letra-erronea', hangman_ids[cont])
            cont = cont + 1;
        } else {
            console.log("perdiste");
        }
    }
}

function getLetraIndex (letra) {
    let indices = [];
    for (let i = 0; i < palabra.length; i++) {
        if (palabra[i] === letra) {
            indices.push(i)
        }
    }
    return indices
}

io.on('connection', socket=> {
    cont=0;
    console.log(socket.id) // cada vez que hay connection, se imprime el id
    io.emit('palabra-size', palabra.length)
    socket.on('send-message', (message, room) => { //mensaje cuando sucede el evento "send-message"
        checkLetra(message)
        // el servidor al recibir el mensaje, responde a todos menos al que lo envio 
        // emitiendo su propio evento

        if (room === "") { // si esta en una room, envia el mensaje a esa room
            socket.broadcast.emit('receive-message', message) // sino mandalo a todos
        } //else if (room == "Privado"){
            /** 
            socket.to(room).emit('receive-message', message + " Desde Privado")
        } else {
            socket.to(room).emit('receive-message', message)
        } 
        */
    })
    socket.on('join-room', room => {
        socket.join(room) // si recibe el evento join-room, se una a una room
    })
})