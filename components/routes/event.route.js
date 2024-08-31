const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const participateController = require('../controllers/participate.controller');
const { authenticate } = require('../services/authenticate.service.js');


router.post('/create', authenticate, eventController.createEvent);
router.post('/admin', authenticate, eventController.inviteAdmin);
router.post('/invite', authenticate, eventController.inviteUser);
router.get('/events', authenticate, eventController.getEvents);

router.post('/invitation/accept/:id', authenticate, participateController.acceptInvitation);
router.get('/invitations', authenticate, participateController.getInvitations);

router.get('/joined', authenticate, participateController.getJoinedEvents);


module.exports = router;