# Examen_POW_freitas

## Examen-Taller-Proyecto-Evaluacion Final de Gustavo Freitas

# ¿Que es el Ahorcado?

El ahorcado es un juego de palabras en el que un jugador intenta adivinar una palabra oculta letra por letra.

## ¿Como se Juega?

Un jugador elige una palabra secreta y representa cada letra con guiones bajos. Los demás jugadores proponen letras, revelando si están presentes y en qué posición. El objetivo es adivinar la palabra antes de completar un dibujo de un hombre ahorcado en un número limitado de intentos, haciendo el juego rápido y divertido.


# ¿Como ejecutar el proyecto?
(Puede clonar el repositorio o ejecutarlo en codespaces)

1. Abrir dos consolas y dirigirse a las carpetas correspondientes del proyecto

2. En la primera consola entrar a la carpeta "client"

```
cd client
```

3. Una vez entramos a la carpeta "client" instalamos las dependencias en cliente

```
npm install
```

4. Luego ejecutaremos el comando ```npm run dev``` para que se ejecute el cliente


4. En la segunda consola entrar a la carpeta "server"

```
cd server
```

5. Una vez entramos en la carpeta "server" instalamos las dependencias en el Server

```
npm install
```

6. Luego ejecutaremos el comando ```npm run dev``` para que se ejecute el servidor

```
npm run dev
```

7. En su navegador de preferencia abra ```http://localhost:5173```

8. Juegue!

---

## Cosas a tener en cuenta

- Se usó la librería Socket.io para manejar los WebSockets.
- Si está trabajando en Codespace, tener cuidado cuando se cierre el Codespace, es propenso a problemas porque deja los servidores abiertos. En caso de cualquier problema: **eliminar** el codespace, crear uno nuevo y seguir los pasos al inicio del documento.
- El anfitrion de esta aplicación es el servidor.
- Se puede jugar de manera individual o multijugador.
- El sistema de juego esta basado en turnos por jugador en la partida.
- Las vidas de los jugadores son en conjunto y comparten el número de errores.
- Tienes 7 vidas por partida.
- Puede escribir las letras tanto en mayusculas como en minúsculas.
- Puede cerrar el navegador y volver a ingresar a la partida sin problemas.
