const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    invitedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
});

InvitationSchema.index({ userID: 1, adminID: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', InvitationSchema);