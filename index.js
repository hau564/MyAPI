require('dotenv').config();

const express = require('express');
const socket = require('socket.io');
const http = require('http');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const server = http.createServer(app);



const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err)); 

app.use(express.json());


const authRoute = require('./components/routes/auth.route.js');
app.use('/auth', authRoute);

const userRoute = require('./components/routes/user.route.js');
app.use('/users', userRoute);

const messageRoute = require('./components/routes/message.route.js');
app.use('/messages', messageRoute);

const eventRoute = require('./components/routes/event.route.js');
app.use('/events', eventRoute);

const notificationRoute = require('./components/routes/notification.route.js');
app.use('/notifications', notificationRoute);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Test 
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/', (req, res) => {
    res.send('Hello World');
});

global.io = socket(server);
global.users = {};
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', async (userId) => {
        users[userId] = socket.id;
        console.log('User registered:', userId);        
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


server.listen(process.env.PORT, '0.0.0.0', () => console.log('Server is running on port ' + process.env.PORT));

