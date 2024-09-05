const { get } = require('mongoose');
const Notification = require('../models/notification.model');

const getNotifications = async(req, res) => {
    try {
        // get 100 notifications from timestamp of user
        const notifications = await Notification.find({createdAt: {$lt: req.params.timestamp}, userID: req.user._id,}).sort({createdAt: -1}).limit(100);
        res.status(200).json(notifications);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while fetching notifications",
            error: err.message,
         });
        console.log(err);
    }
}

module.exports = {
    getNotifications,
}