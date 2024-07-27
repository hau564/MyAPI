require('dotenv').config();

const express = require('express');
const socket = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err)); 

app.use(express.json());


const authRoute = require('./components/auth/auth.route.js');
app.use('/auth', authRoute);

const userRoute = require('./components/user/user.route.js');
app.use('/users', userRoute);

const messageRoute = require('./components/message/message.route.js');
app.use('/messages', messageRoute);

users = {};

app.get('/', (req, res) => {
    io.to(users['669cf99daa753eb21a3a9e28'])
        .emit('receiveMessage', {content: 'Hello from server'});
    res.send('Hello World');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', async (userId) => {
        users[userId] = socket.id;
        console.log('User registered:', userId);        
    });

    // Listen for incoming messages
    socket.on('sendMessage', async (data) => {
        try {
            // const message = new Message({
            //     sender: data.sender,
            //     receiver: data.receiver,
            //     content: data.content
            // });
            // await message.save();

            // // Emit the message to the receiver
            // io.to(data.receiver).emit('receiveMessage', message);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


server.listen(process.env.PORT, '0.0.0.0', () => console.log('Server is running on port ' + process.env.PORT));

