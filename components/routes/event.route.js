const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const participateController = require('../controllers/participate.controller');
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../services/authenticate.service.js');
/**
 * @swagger
 * /create:
 *  post:
 *   summary: Create an event
 *  description: Create an event
 *  requestBody:
 *   required: true
 *  content:
 *  application/json:
 */
router.post('/create', authenticate, adminController.createEvent);
router.post('/admin', authenticate, adminController.inviteAdmin);
router.post('/invite', authenticate, adminController.inviteUser);
router.post('/join/:id', authenticate, adminController.joinEvent);
router.post('/approve/:id', authenticate, adminController.acceptRequest);

router.post('/search', authenticate, eventController.searchEvent);
router.get('/get-admin-info/:id', authenticate, eventController.isAdmin);
router.get('/get/:id', eventController.getEvent);
router.get('/get-participants/:id', authenticate, eventController.getParticipants);
router.get('/get-role/:id', authenticate, eventController.getRole);
router.get('/get-admins/:id', authenticate, eventController.getAdmins);

router.post('/invitation/accept/:id', authenticate, participateController.acceptInvitation);
router.get('/invitations', authenticate, participateController.getInvitations);
router.post('/request-join', authenticate, participateController.requestJoin);
router.get('/request-info/:id', authenticate, participateController.getRequestInfo);

router.get('/joined', authenticate, participateController.getJoinedEvents);


module.exports = router;