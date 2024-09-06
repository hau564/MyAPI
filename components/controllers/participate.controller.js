const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');
const Request = require('../models/request.model');
const UserRequest = require('../models/userRequest.model');

const EventQuery = require('../queries/event.query');
const RequestQuery = require('../queries/request.query');
const NotificationQuery = require('../queries/notification.query');

const { MongoClient } = require('mongodb');

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

const requestJoin = async (req, res) => {
    // const client = new MongoClient(process.env.DATABASE_URL);
    // try {
    //     await client.connect();
    //     const session = client.startSession();

    //     const transactionOptions = {
    //         readPreference: 'primary',
    //         readConcern: { level: 'local' },
    //         writeConcern: { w: 'majority' }
    //       };
    //     session.startTransaction(transactionOptions);

        try {
            const users = req.body.userIDs;
            flag = false;
            for (let i = 0; i < users.length; i++) {
                if (users[i] == req.user._id) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                return res.status(403).json({msg: 'Unauthorized to request join event'});
            }
            const request = await RequestQuery.createRequest(req.body.eventID, users);        
            const requestSent = await RequestQuery.confirmRequest(request._id, req.user._id, 'Accepted');
            const event = await Event.findById(request.eventID);
            if (requestSent) {
                await NotificationQuery.addNotification(req.user._id, 'Request Sent', request._id, request.eventID, 'Your request to join the event ' + event.title + ' has been sent');
            }
            else {
                await NotificationQuery.addNotification(req.user._id, 'Request Created', request._id, request.eventID, 'Your request to join the event ' + event.title + ' has been created. Waiting for other users to confirm');
            }
            res.status(200).json(request);
        }
        catch (err) {
            await session.abortTransaction();
            res.status(400).json({error: err.message, msg: 'Failed to request join event'});
            console.log(err.message);
        }
    //     finally {
    //         session.endSession();
    //     }
    // }
    // finally {
    //     await client.close();
    // }
}


const getRequestInfo = async (req, res) => {
    try {
        const request = await Request.findOne({_id: req.params.id});
        if (!request) {
            return res.status(404).json({msg: 'Request not found'});
        }
        flag = false;
        const admin = await Admin.findOne({eventID: request.eventID, userID: req.user._id});
        if (admin) {
            flag = true;
        }
        const userRequest = await UserRequest.find({requestID: request._id, userID: req.user._id});
        if (userRequest) {
            flag = true;
        }
        if (!flag) {
            res.status(403).json({msg: 'Unauthorized to get request info'});
        }
        
        const event = await Event.findById(request.eventID).lean();
        event.longitude = event.location.coordinates[0];
        event.latitude = event.location.coordinates[1];

        const users = await UserRequest.aggregate(
            [
                {
                    $match: {requestID: request._id}
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userID',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        'user.password': 0,
                        'user.email': 0,
                        'user.__v': 0
                    }
                },
                // reroot
                {
                    $replaceRoot: {newRoot: '$user'}
                }
            ]
        );
        res.status(200).json({event, users});
    }
    catch (err) {
        res.status(400).json({error: err.message, msg: 'Failed to get request info'});
        console.log(err);
    }
}

module.exports = {
    acceptInvitation,  
    getInvitations,
    getJoinedEvents,
    requestJoin,
    getRequestInfo,
};