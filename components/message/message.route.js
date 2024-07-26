const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const { authenticate } = require('../services/authenticate.service.js');

router.post('/send', authenticate, messageController.send);
router.get('/inbox/:id', authenticate, messageController.inbox);
router.get('/inbox/:id/:skip', authenticate, messageController.inbox);
router.get('/users', authenticate, messageController.users);

module.exports = router;