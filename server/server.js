const io = require('socket.io')(3000, { // el puerto donde se ubica el server
    cors: {
        origin: ['http://localhost:5173' , 'http://172.16.5.4:5173', 'http://127.0.0.1:5173']        // origen de donde se conectan los clients
    }
})

let hangman_ids = ["piso","palo","cuerda","cabeza","cuerpo","brazos","pies"]
let cont = 0;
let jugadoresID = []

let palabra = ""
let letrasRestantes = ""

async function getWord() {
    await fetch('https://pow-3bae6d63ret5.deno.dev/word').then(res => res.json()).then(data => {
        palabra = data.word
        letrasRestantes = palabra
    })
    console.log(palabra)
}

getWord()
console.log(palabra)


function removerLetras (letra) {
    let patron = new RegExp(letra, "g")
    letrasRestantes = letrasRestantes.replace(patron, "")
    console.log(letrasRestantes)
    if (letrasRestantes.length === 0) {
        console.log("ganaste");
        io.emit('ganaste')
    }

}

function checkLetra (letra) { //revisa si la letra esta en la palabra
    if ( palabra.includes(letra)) {
        console.log("letra-correcta"); //imprime que la palabra es correcta en consola del server
        let indices = getLetraIndex(letra) // consigue los indices de la letra en la palabra
        removerLetras(letra)
        io.emit('letra-correcta', indices , letra)  // emit el evento letra-correcta a todos los users y les pasa los indices y la letra  
    } else {
        console.log("letra-erronea"); //imprime que la palabra es incorrecta en consola del server
        if (cont < 7) { // si el numero de errores es a menor a 7 envia el evento letra-erronea
            io.emit('letra-erronea', hangman_ids[cont])
            cont = cont + 1; //aumenta el contador
            if (cont === 7){
                console.log("perdiste");
                io.emit('perdiste') // si el numero de errores es igual a 7 envia el evento perdiste
            }
        }
    }
}

function ADDjugador (socketID) {
    jugadoresID.push({ID : socketID, turno : false})
}

function REMOVEjugador (socketID) {
    for (const jugador of jugadoresID) {
        if (jugador.ID === socketID) {
            jugadoresID.splice(jugadoresID.indexOf(jugador), 1)
        }
    }
}

function changeAllFalse() {
    for (const jugador of jugadoresID) {
        jugador.turno = false
    }
}

function turnosHandler(socketID) {
    for (const jugador of jugadoresID) {
        if (jugador.ID === socketID) {
            jugador.turno = true
        }
        if (jugador.turno === false) {
            io.emit('turno-de', jugador.ID)
            if (jugadoresID.indexOf(jugador) === jugadoresID.length - 1) {
                changeAllFalse()
            }
            break
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
    ADDjugador(socket.id)
    console.log(socket.id) // cada vez que hay connection, se imprime el id
    io.to(socket.id).emit('palabra-size', palabra.length)
    if (jugadoresID[0].ID === socket.id) {
        io.emit('turno-de', jugadoresID[0].ID)
        jugadoresID[0].turno = true
    }
    console.log(jugadoresID)

    socket.on('disconnect', () => {
        console.log('user disconnected' + socket.id)
        REMOVEjugador(socket.id)
    })

    socket.on('send-message', (message, room) => { //mensaje cuando sucede el evento "send-message"
        checkLetra(message)
        turnosHandler(socket.id)
        if (room === "") { // si esta en una room, envia el mensaje a esa room
            socket.broadcast.emit('receive-message', message) // sino mandalo a todos
        } 
    })

    socket.on('join-room', room => {
        socket.join(room) // si recibe el evento join-room, se una a una room
    })
})