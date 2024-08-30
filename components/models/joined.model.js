const mongoose = require('mongoose');

const joinedSchema = new mongoose.Schema({
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
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

joinedSchema.index({ eventID: 1, userID: 1 }, { unique: true });

module.exports = mongoose.model('Joined', joinedSchema);