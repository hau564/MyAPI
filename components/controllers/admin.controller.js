const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Request = require('../models/request.model');
const Invitation = require('../models/invitation.model');

const EventQuery = require('../queries/event.query');
const NotificationQuery = require('../queries/notification.query');

const mongoose = require('mongoose');

const createEvent = async(req, res) => {
    try {
        const event = new Event({
            title: req.body.title,
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
            name: req.body.name,
            address: req.body.address,
        });
        const admin = new Admin({
            eventID: event._id,
            userID: req.user._id,
            mode: "Create",
        });
        await admin.save();
        await event.save();
        
        const joined = new Joined({
            eventID: event._id,
            userID: req.user._id,
        });
        await joined.save();
        await NotificationQuery.addNotification(req.user._id, "Event Created", event._id, event._id, "You created event " + event.title);
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
        await NotificationQuery.addNotification(req.user._id, "Event Joined", joined._id, event._id, "You joined event " + event.title);
        const admins = await Admin.find({eventID: req.params.id, mode: {$ne: "Deleted"}});
        for (let admin of admins) {
            await NotificationQuery.addNotification(admin.userID, "User Joined", joined._id, event._id, "User " + req.user.name + " joined event " + event.title);
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

const acceptRequest = async(req, res) => {
    try {
        const request = await Request.findOne({_id: req.params.id});
        if (!request) {
            return res.status(404).json({msg: "Request not found"});
        }
        if (request.status == "Waiting") {
            return res.status(403).json({msg: "Request not found"});
        }
        if (request.status !== "Pending") {
            return res.status(403).json({msg: "Request already processed"});
        }
        const admin = await Admin.findOne({eventID: request.eventID, userID: req.user._id});
        if (!admin || admin.mode == "Deleted") {
            return res.status(403).json({msg: "Only admins can accept requests"});
        }
        await EventQuery.acceptRequest(request);
        res.status(200).json({msg: "Request accepted"});
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while accepting the request",
            error: err.message,
         });    
        console.log(err);
    }
}

module.exports = {
    createEvent,
    inviteAdmin,
    inviteUser,
    joinEvent ,
    acceptRequest,
};