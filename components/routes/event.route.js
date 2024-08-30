const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../services/authenticate.service.js');

router.post('/create', authenticate, (req, res) => eventController.createEvent(req, res));
// router.post('/invite-admin', authenticate, (req, res) => eventController.inviteAdmin(req, res));

module.exports = router;