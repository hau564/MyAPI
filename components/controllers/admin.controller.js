const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');

const EventQuery = require('../queries/event.query');

const mongoose = require('mongoose');

const createEvent = async(req, res) => {
    try {
        const event = new Event({
            description: req.body.description,
            start: req.body.start,
            duration: req.body.duration,
            location: {
                coordinates: [req.body.longitude, req.body.latitude],
            },
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
        
        event.longitude = event.location.coordinates[0];
        event.latitude = event.location.coordinates[1];
        res.status(200).json({event, admin});
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while creating the event",
            error: err.message,
         });
        console.log(err);
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

const joinEvent = async(req, res) => {
    try {
        const event = await Event.findOne({_id: req.params.id});
        if (!event) {
            return res.status(404).json({msg: "Event not found"});
        }
        const admin = await Admin.findOne({eventID: req.params.id, userID: req.user._id});
        if (event.joinMode !== "Everyone" && (!admin || admin.mode == "Deleted")) {
            return res.status(403).json({msg: "Unable to join event, please send a request"});
        }
        const count = await EventQuery.countJoined(event._id);
        if (count >= event.maxParticipants) {
            return res.status(403).json({msg: "Event is full"});
        }
        const joined = new Joined({
            eventID: req.params.id,
            userID: req.user._id,
        });
        try {
            await joined.save();
        }
        catch (err) {
            return res.status(400).json({msg: "User already joined"});
        }
        res.status(200).json(joined);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while joining the event",
            error: err.message,
         });
    }
}

module.exports = {
    createEvent,
    inviteAdmin,
    inviteUser,
    joinEvent 
};