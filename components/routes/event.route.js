const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const participateController = require('../controllers/participate.controller');
const { authenticate } = require('../services/authenticate.service.js');


router.post('/create', authenticate, eventController.createEvent);
router.post('/admin', authenticate, eventController.inviteAdmin);
router.post('/invite', authenticate, eventController.inviteUser);

router.post('/accept/:id', authenticate, participateController.acceptInvitation);

module.exports = router;