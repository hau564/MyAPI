const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');

const EventQuery = require('../queries/event.query');

const acceptInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findOne({_id: req.params.id});
        if (!invitation) {
            return res.status(404).json({msg: 'Invitation not found'});
        }        
        if (invitation.userID.toString() !== req.user._id.toString()) {
            return res.status(403).json({msg: 'Unauthorized to accept this invitation'});
        }
        
        const admin = await Admin.findOne({_id: invitation.adminID});
        if (req.body.status == "accept") {
            await Invitation.deleteOne({_id: invitation._id});
            const joined = new Joined({
                eventID: admin.eventID,
                userID: invitation.userID,
            });
            try{
                await joined.save();
            }
            catch (err) {
                return res.status(400).json({error: err.message, msg: 'User already joined'});
            }
            res.status(200).json({joined});
        }
        else if (req.body.status == 'decline') {
            await Invitation.deleteOne({_id: invitation._id});
            res.status(200).json({msg: 'Invitation declined'});
        }
        else
            res.status(400).json({msg: 'Invalid status'});
    }
    catch (err) {
        res.status(400).json({error: err.message, msg: 'Failed to accept invitation'});
    }
}

const getInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({userID: req.user._id});
        res.status(200).json({invitations});
    }
    catch (err) {
        res.status(400).json({error: err.message, msg: 'Failed to get invitations'});
    }
}

const getJoinedEvents = async (req, res) => {
    try {
        // const joined = await Joined.find({userID: req.user._id});
        const events = await EventQuery.getJoinedEvents(req.user._id);
        for (let i = 0; i < events.length; i++) {
            events[i].event.longitude = events[i].event.location.coordinates[0];
            events[i].event.latitude = events[i].event.location.coordinates[1];
        }   
        res.status(200).json(events);
    }
    catch (err) {
        res.status(400).json({error: err.message, msg: 'Failed to get joined events'});
    }
}

module.exports = {
    acceptInvitation,  
    getInvitations,
    getJoinedEvents,
};