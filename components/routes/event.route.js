const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const participateController = require('../controllers/participate.controller');
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../services/authenticate.service.js');


router.post('/create', authenticate, adminController.createEvent);
router.post('/admin', authenticate, adminController.inviteAdmin);
router.post('/invite', authenticate, adminController.inviteUser);
router.post('/join/:id', authenticate, adminController.joinEvent);

router.get('/search', authenticate, eventController.searchEvent);
router.get('/get-admin-info/:id', authenticate, eventController.isAdmin);
router.get('/get/:id', eventController.getEvent);

router.post('/invitation/accept/:id', authenticate, participateController.acceptInvitation);
router.get('/invitations', authenticate, participateController.getInvitations);

router.get('/joined', authenticate, participateController.getJoinedEvents);


module.exports = router;