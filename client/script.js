import { io} from 'socket.io-client'

const joinRoomButton = document.getElementById('room-button')
const messageInput = document.getElementById('message-input')
const roomInput = document.getElementById('room-input')
const form = document.getElementById('form')
const socket = io('http://localhost:3000')

socket.on('connect', () => { //mensaje cuando sucede el evento "connect"
    displayMessage(`you connected with id: ${socket.id}`)
})

socket.on('receive-message', (message) => { //mensaje cuando sucede el evento "connect"
    displayMessage(`mensaje recibido: ${message}`)
})

socket.on('palabra-size', (size) => {
    for (let i = 0; i < size; i++) {
        const letra = document.createElement('span')
        letra.textContent = " "
        letra.id = i
        document.getElementById('palabra-container').append(letra)
    }
})

socket.on('turno-de', (id) => {
    if (id === socket.id) {
        document.getElementById('send-button').disabled = false
        document.getElementById('turno').textContent = "Es tu turno"
    } else {
        document.getElementById('send-button').disabled = true
        document.getElementById('turno').textContent = "No es tu turno"
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
    displayMessage(message)
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