const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const bodyParser = require('body-parser')
const cors = require('cors')
app.set('view engine', 'ejs')
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
app.get('/:labroom', (req, res) => {
  res.render('labroom', { roomId: req.params.labroom })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log(roomId,userId);
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})
server.listen(process.env.PORT || 4000,()=>{
  console.log(`server started at  4000 🚀🚀🚀`)
})