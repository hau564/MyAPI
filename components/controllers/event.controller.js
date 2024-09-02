const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');

const EventQuery = require('../queries/event.query');

const mongoose = require('mongoose');

const searchEvent = async (req, res) => {
    try {
        await Event.aggregate([
            {
              $geoNear: {
                near: { type: "Point", coordinates: [-74.0060, 40.7128] }, // [longitude, latitude]
                distanceField: "dist.calculated",
                maxDistance: 1000, // 1000 meters
                spherical: true
              }
            }
          ])
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