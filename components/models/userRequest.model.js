const mongoose = require('mongoose');

const userRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        required: true
    },
});

module.exports = mongoose.model('UserRequest', userRequestSchema);