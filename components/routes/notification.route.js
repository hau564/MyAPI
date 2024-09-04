const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller.js');
const { authenticate } = require('../services/authenticate.service.js');

router.get('/get/:timestamp', authenticate, notificationController.getNotifications);

module.exports = router;