import { io} from 'socket.io-client'

const closeBtn = document.getElementById('closeModal')
const modal = document.getElementById('modal')
const joinRoomButton = document.getElementById('room-button')
const messageInput = document.getElementById('message-input')
const roomInput = document.getElementById('room-input')
const form = document.getElementById('form')
const socket = io('http://localhost:3000')
const hangman_ids = ["piso","palo","cuerda","cabeza","cuerpo","brazos","pies"]

socket.on('connect', () => { //mensaje cuando sucede el evento "connect"
    displayMessage(`Te has conectado con la ID : ${socket.id}`)
})

socket.on('receive-message', (message , id) => { //mensaje cuando sucede el evento "connect"
    displayMessage(`${id} envio : ${message.toUpperCase()}`)
})

socket.on('perdiste', (palabra) => {
    document.getElementById('resultado').textContent = "Perdiste manito";
    document.getElementById('palabra-msg').textContent = "La palabra era: " + palabra;
    modal.classList.add('open');
})

socket.on('ganaste', () => {
    document.getElementById('resultado').textContent = "Ganaste locotron";
    modal.classList.add('open');
})

closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    socket.emit('reiniciar-partida')
    resetHangman()
})

socket.on('palabra-size', (size) => {
    for (let i = 0; i < size; i++) {
        const letra = document.createElement('span')
        letra.textContent = " "
        letra.id = i
        document.getElementById('palabra-container').append(letra)
    }
})

socket.on('vaciar-palabra', (size) => {
    for (let i = 0; i < size; i++) {
        const letra = document.getElementById(i)
        document.getElementById('palabra-container').removeChild(letra)
    }
})

socket.on('turno-de', (id, cont=0) => {
    if (id === socket.id) {
        document.getElementById('send-button').disabled = false
        document.getElementById('turno').textContent = "Es tu turno"
        document.getElementById('errores').textContent = "Numero de Errores: " + cont
    } else {
        document.getElementById('send-button').disabled = true
        document.getElementById('turno').textContent = "No es tu turno"
        document.getElementById('errores').textContent = "Numero de Errores: " + cont
    }
})

socket.on('letra-erronea',  (id)  => {
    document.getElementById(id).style.fill = "black"
})

socket.on('letra-correcta',  (indices , letra)  => {
    indices.forEach(element => {
        document.getElementById(element).textContent = letra.toUpperCase()
    });
})

form.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    const room = roomInput.value
    
    if (message === '') return
    displayMessage(message.toUpperCase())
    socket.emit('send-message', message, room)
    

    messageInput.value = ""
})

joinRoomButton.addEventListener('click', () => {
    const room = roomInput.value
    socket.emit('join-room', room)
})

function displayMessage(message) {
    const div = document.createElement('div')
    div.textContent = message
    document.getElementById('message-container').append(div)
}

function resetHangman() {
    hangman_ids.forEach(element => {
        document.getElementById(element).style.fill = "none"
    });
}