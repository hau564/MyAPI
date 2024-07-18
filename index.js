require('dotenv').config();

const express = require('express');
const app = express();

// const mongoose = require('mongoose');
// mongoose.connect(process.env.DATABASE_URL)
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Could not connect to MongoDB', err)); 

app.use(express.json());


// const authRoute = require('./components/auth/auth.route.js');
// app.use('/auth', authRoute);

app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

app.listen(process.env.PORT || 3000, () => console.log('Server is running on port 3000'));
