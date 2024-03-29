const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const Socket = require('socket.io');
const dotenv = require('dotenv')
dotenv.config()

app.use(cors({
  origin: process.env.CLIENT_URL
}));

const socketIO = require('socket.io')(http, {
  cors: {
    origins: process.env.CLIENT_URL
  }
});

type UserData = {
  roomName : string
  userName : string
  socketID : string
}

type MessageData = {
text: string
name: string
room: string
id: string
socketID: string
}

type UserTyping = {
userTyping: string
room: string
}


type ChangeConfig = {
  color: string 
  size: number
}

type BeginDraw = {
  x:  number
  y: number
}


let users: UserData[] = [];

socketIO.on('connection', (socket: typeof Socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  
  socket.on('beginPath', (arg: BeginDraw) => {
    socket.broadcast.emit('beginPath', arg)
  })

  socket.on('drawLine', (arg: BeginDraw) => {
    socket.broadcast.emit('drawLine', arg)
  })

  socket.on('changeConfig', (arg: ChangeConfig) => {
    socket.broadcast.emit('changeConfig', arg)
  })


  socket.on('newUser', (data: UserData) => {
    socket.join(data.roomName);
    users.push(data);
    socketIO.to(data.roomName).emit('newUserResponse', users);
  });

  socket.on('message', (data: MessageData) => {
    socketIO.to(data.room).emit('messageResponse', data);
  });

  socket.on('typing', (data: UserTyping) => socket.broadcast.emit('typingResponse', data) );


  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    users = users.filter((user) => user.socketID !== socket.id);
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });

});


const PORT = process.env.PORT || 4000

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});