const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');

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
        const admin = createAdmin(event._id, req.user._id, "Create");
        await event.save();
        
        res.status(200).json({event, admin});
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while creating the event",
            error: err.message,
         });
    }
}

const createAdmin = function(eventID, userID, mode) {
    const admin = new Admin({
        eventID: eventID,
        userID: userID,
        mode: mode,
    });
    admin.save();
    return admin;
}

const inviteAdmin = async(req, res) => {
    try {
        // admin = createAdmin(req.body.eventID, req.body.userID, req.body.mode);
        // res.status(200).json(admin);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while inviting the admin",
            error: err.message,
         });
    }
}

module.exports = {
    createEvent,
    inviteAdmin,
};