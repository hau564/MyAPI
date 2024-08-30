const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    eventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mode: {
        type: String,
        enum: ["Create", "Edit", "Invite", "Deleted"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

adminSchema.index({ eventID: 1, userID: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);