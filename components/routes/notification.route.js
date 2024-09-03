const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller.js');


router.get('/get/:timestamp', notificationController.getNotifications);

module.exports = router;