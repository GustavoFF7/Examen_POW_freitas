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

let letrasCorrectas = []
let letrasIncorrectas = []


async function getWord() {
    await fetch('https://pow-3bae6d63ret5.deno.dev/word').then(res => res.json()).then(data => {
        palabra = quitarTildes(data.word)
        letrasRestantes = palabra
    })
    console.log(palabra)
}

getWord()

function quitarTildes(palabra) {
    // Definir un objeto con las letras y su correspondiente sin tilde
    const tildes = {
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u'
    };
    const palabraSinTildes = palabra.replace(/[áéíóúü]/g, letra => tildes[letra] || letra);
    return palabraSinTildes;
}


function removerLetras (letra) {
    let patron = new RegExp(letra, "g")
    letrasRestantes = letrasRestantes.replace(patron, "")
    if (letrasRestantes.length === 0) {
        console.log("ganaste");
        io.emit('ganaste')
    }

}

function checkLetra (letra) { //revisa si la letra esta en la palabra
    letra = letra.toLocaleLowerCase()
    if ( palabra.includes(letra)) {
        let indices = getLetraIndex(letra) // consigue los indices de la letra en la palabra
        removerLetras(letra)
        letrasCorrectas.push(letra)
        io.emit('letra-correcta', indices , letra)  // emit el evento letra-correcta a todos los users y les pasa los indices y la letra  
    } else {
        if (cont < 7) { // si el numero de errores es a menor a 7 envia el evento letra-erronea
            letrasIncorrectas.push(letra)
            io.emit('letra-erronea', hangman_ids[cont])
            cont = cont + 1; //aumenta el contador
            if (cont === 7){
                console.log("perdiste");
                console.log(palabra);
                io.emit('perdiste', palabra) // si el numero de errores es igual a 7 envia el evento perdiste
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
            io.emit('turno-de', jugador.ID , cont)
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

function enviarLetrasCorrectas(socket) {
    for (const letra of letrasCorrectas) {
        let indices = getLetraIndex(letra)
        io.to(socket.id).emit('letra-correcta', indices , letra)
    }
}

function enviarLetrasIncorrectas(socket) {
    for (let i = 0; i < letrasIncorrectas.length; i++) {
        io.to(socket.id).emit('letra-erronea', hangman_ids[i])
    }
}

io.on('connection', socket=> {
    ADDjugador(socket.id)
    console.log("se conecto : ID = " + socket.id) // cada vez que hay connection, se imprime el id
    io.to(socket.id).emit('palabra-size', palabra.length)
    if (letrasCorrectas.length > 0) {
        enviarLetrasCorrectas(socket)
    }
    if (letrasIncorrectas.length > 0) {
        enviarLetrasIncorrectas(socket)
        cont = letrasIncorrectas.length
    }
    if (jugadoresID[0].ID === socket.id) {
        io.emit('turno-de', jugadoresID[0].ID)
        jugadoresID[0].turno = true
    }

    socket.on('disconnect', () => {
        console.log('se desconecto: ID = ' + socket.id)
        turnosHandler(socket.id)
        REMOVEjugador(socket.id)
    })

    socket.on('send-message', (message, room) => { //mensaje cuando sucede el evento "send-message"
        checkLetra(message)
        turnosHandler(socket.id)
        if (room === "") { // si esta en una room, envia el mensaje a esa room
            socket.broadcast.emit('receive-message', message , socket.id) // sino mandalo a todos
        } 
    })

    socket.on('join-room', room => {
        socket.join(room) // si recibe el evento join-room, se una a una room
    })

    socket.on('reiniciar-partida', () => {
        cont = 0;
        io.emit('vaciar-palabra', palabra.length)
        getWord().then(() => {
        io.emit('palabra-size', palabra.length)
        io.emit('turno-de', jugadoresID[0].ID)
        })
        letrasCorrectas = []
        letrasIncorrectas = []
        jugadoresID[0].turno = true
        changeAllFalse()
    })
})