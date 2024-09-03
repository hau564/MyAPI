const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Event Created", "User Joined", "Invitation Sent", "Invitation Received"],
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
});

module.exports = mongoose.model('Notification', notificationSchema);