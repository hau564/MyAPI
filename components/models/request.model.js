const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    eventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    sentAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Waiting', 'Pending', 'Accepted', 'Rejected'],
        required: true,
        default: 'Waiting'
    },
});

module.exports = mongoose.model('Request', requestSchema);