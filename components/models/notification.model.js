const { content } = require('googleapis/build/src/apis/content');
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Event Created", "Event Joined", "User Joined", "Request Sent", "Request Created"],
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    eventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    content: {
        type: String,
    },
});

module.exports = mongoose.model('Notification', notificationSchema);