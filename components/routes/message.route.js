const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../services/authenticate.service.js');

router.post('/send', authenticate, (req, res) => messageController.send(req, res));
router.get('/inbox/:id', authenticate, messageController.inbox);
router.get('/inbox/:id/:skip', authenticate, messageController.inbox);
router.get('/last-messages', authenticate, messageController.lastMessages);

module.exports = router;