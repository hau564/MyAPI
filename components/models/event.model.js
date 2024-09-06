const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    start: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        // required: true
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    type: {
        type: String,
        // required: true
    },
    joinMode: {
        type: String,
        enum: ["Everyone", "Accepted Only", "Invited Only"],
        required: true
    },
    maxParticipants: {
        type: Number,
        // required: true
    },
    deadline: {
        type: Date,
        default: Date.now
    },
    address: {
        type: String,
        // required: true
    },
});

eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Event', eventSchema);