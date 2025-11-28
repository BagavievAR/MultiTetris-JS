import http from 'http'

import express from 'express'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('New client connected')
})

app.get('/', (_, res) => {
  res.send('Server is running')
})

server.listen(3000, () => {
  console.log('Server listening on port 3000')
})
