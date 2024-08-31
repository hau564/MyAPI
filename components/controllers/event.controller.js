const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');

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
        const admin = new Admin({
            eventID: event._id,
            userID: req.user._id,
            mode: "Create",
        });
        await admin.save();
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

const inviteAdmin = async(req, res) => {
    try {
        const admin = await Admin.findOne({eventID: req.body.eventID, userID: req.user._id});
        if (admin.mode !== "Create") {
            return res.status(403).json({msg: "Only owner can invite admins"});
        }
        if (req.body.mode == "Create") {
            return res.status(403).json({msg: "Cannot edit admin with Create mode"});
        }
        const oldAdmin = await Admin.findOne({eventID: req.body.eventID, userID: req.body.userID});
        await Admin.deleteOne({_id: oldAdmin._id});
        const newAdmin = new Admin({
            eventID: req.body.eventID,
            userID: req.body.userID,
            mode: req.body.mode,
        });
        await newAdmin.save();
        res.status(200).json(newAdmin);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while inviting the admin",
            error: err.message,
         });
    }
}


const inviteUser = async(req, res) => {
    try {
        const admin = await Admin.findOne({eventID: req.body.eventID, userID: req.user._id});
        
        if (!admin || admin.mode == "Deleted") {
            return res.status(403).json({msg: "Only admins can invite users"});
        }
        if (await Joined.findOne({eventID: req.body.eventID, userID: req.body.userID})) {
            return res.status(403).json({msg: "User already joined"});
        }
        
        const invitation = new Invitation({
            userID: req.body.userID,
            adminID: admin._id,
            expiresIn: req.body.expiresIn,
        });
        await invitation.save();

        res.status(200).json(invitation);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while inviting the user",
            error: err.message,
         });
    }
}

const getEvents = async(req, res) => {

}

module.exports = {
    createEvent,
    inviteAdmin,
    inviteUser,
    getEvents,
};