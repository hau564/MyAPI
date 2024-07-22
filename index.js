require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err)); 

app.use(express.json());


const authRoute = require('./components/auth/auth.route.js');
app.use('/auth', authRoute);

const userRoute = require('./components/user/user.route.js');
app.use('/users', userRoute);

app.listen(process.env.PORT, '0.0.0.0', () => console.log('Server is running on port ' + process.env.PORT));

