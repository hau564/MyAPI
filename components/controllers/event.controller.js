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
        res.status(200).json(events)
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while searching for the event",
            error: err.message,
        });
    }
}

module.exports = {
    searchEvent,
};