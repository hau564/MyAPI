const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    decription: {
        type: String
    },
    start: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    location: {
        type: [Number],
        required: true
    },
    type: {
        type: String,
        required: true
    },
    joinMode: {
        type: {
            String,
            enum: ['Everyone', 'Accepted Only', 'Invited Only'],
            required: true
        }
    },
    maxParticipants: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Event', eventSchema);