const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');

const EventQuery = require('../queries/event.query');

const mongoose = require('mongoose');

const searchEvent = async (req, res) => {
    try {
        const events = await Event.aggregate([
            {
                $geoNear: {
                    near: { 
                        type: "Point", 
                        coordinates: [req.body.longitude, req.body.latitude] 
                    },
                    distanceField: "dist.calculated",
                    maxDistance: req.body.distance,
                    spherical: true
                }
            },
            // {
                // $project: {
                //     longitude: { $arrayElemAt: ["$location.coordinates", 0] }, // longitude
                //     latitude: { $arrayElemAt: ["$location.coordinates", 1] }   // latitude
                // }
            // }
        ]);     
        for (let i = 0; i < events.length; i++) {
            events[i].longitude = events[i].location.coordinates[0];
            events[i].latitude = events[i].location.coordinates[1];
        }   
        res.status(200).json(events)
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while searching for the event",
            error: err.message,
        });
    }
}

const isAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({ eventID: req.params.id, userID: req.user._id });
        if (admin) {
            res.status(200).json({ admin }); 
        }
        else {
            res.status(200).json({ msg: "User is not an admin of event" });
        }
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while checking if user is an admin",
            error: err.message,
        });
        console.log(err);
    }
}

const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        // create longitude and latitude fields
        event.longitude = event.location.coordinates[0];
        event.latitude = event.location.coordinates[1];
        res.status(200).json(event);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while getting the event",
            error: err.message,
        });
    }
}

const getParticipants = async (req, res) => {
    try {
        const admin = await Admin.findOne({ eventID: req.params.id, userID: req.user._id });
        const joined = await Joined.find({ eventID: req.params.id, userID: req.user._id });
        if ((!admin || admin.mode == "Deleted") && !joined) {
            return res.status(403).json({ msg: "Unauthorized to get participants" });
        }
        const participants = await Joined.aggregate([
            {
                $match: { eventID: new mongoose.Types.ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            // use user as root
            {
                $replaceRoot: {
                    newRoot: "$user"
                }
            },
            {
                $project: {
                    password: 0,
                    __v: 0,
                    email: 0
                }
            }
        ]);
        res.status(200).json(participants);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while getting the participants",
            error: err.message,
        });
        console.log(err);
    }
}

const getRole = async (req, res) => {
    try {
        const admin = await Admin.findOne({ eventID: req.params.id, userID: req.user._id });
        if (admin) {
            return res.status(200).json("admin");
        }
        const joined = await Joined.findOne({ eventID: req.params.id, userID: req.user._id });
        if (joined) {
            return res.status(200).json("participant");
        }
        res.status(200).json("none");
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while getting the role",
            error: err.message,
        });
        console.log(err);
    }
}

const getAdmins = async (req, res) => {
    try {
        const admins = await EventQuery.getAdmins(req.params.id);
        res.status(200).json(admins);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while getting the admins",
            error: err.message,
        });
        console.log(err);
    }
}

module.exports = {
    searchEvent,
    isAdmin,
    getEvent,
    getParticipants,
    getRole,
    getAdmins
};