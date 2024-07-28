const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const { authenticate } = require('../services/authenticate.service.js');

module.exports = (io, users) => {
    router.post('/send', authenticate, (req, res) => messageController.send(io, users, req, res));
    router.get('/inbox/:id', authenticate, messageController.inbox);
    router.get('/inbox/:id/:skip', authenticate, messageController.inbox);
    router.get('/users', authenticate, messageController.users);
    return router;
};