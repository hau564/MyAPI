const Event = require('../models/event.model');

const createEvent = async(req, res) => {
    try {
        const event = new Event({
            description: req.body.description,
            start: req.body.start,
            duration: req.body.duration,
            location: req.body.location,
            type: req.body.type,
            joinMode: req.body.joinMode,
            maxParticipants: req.body.maxParticipants,
            deadline: req.body.deadline,
        });
        
        await event.save();
        
        res.status(200).json(event);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while creating the event",
            error: err.message,
         });
    }
}

module.exports = {
    createEvent,
};