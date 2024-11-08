const Notification = require('../models/notification.model');

async function addNotification(userID, type, target, eventID, content) {
    try {
        const notification = new Notification({
            userID: userID,
            type: type,
            target: target,
            eventID: eventID,
            content: content
        });
        await notification.save();
        global.io.to(global.users[userID]).emit('receiveNotification', notification);
        return notification;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    addNotification
};
