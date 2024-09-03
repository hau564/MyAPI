const Notification = require('../models/notification.model');

async function addNotification(userID, type, target) {
    try {
        const notification = new Notification({
            userID: userID,
            type: type,
            target: target
        });
        await notification.save();
        return notification;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    addNotification
};
