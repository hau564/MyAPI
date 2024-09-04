const e = require('express');
const Request = require('../models/request.model');
const UserRequest = require('../models/userRequest.model');
const NotificationQuery = require('./notification.query');
const EventQuery = require('./event.query');

async function createRequest(eventID, userIDs) {
    try {
        const request = new Request({
            eventID: eventID
        });
        await request.save();
        for (let user of userIDs) {
            const userRequest = new UserRequest({
                requestID: request._id,
                userID: user
            });
            await userRequest.save();
        }
        const admins = await EventQuery.getAdmins(eventID);
        for (let admin of admins) {
            await NotificationQuery.addNotification(admin.userID, 'New Request', request._id);
        }
        return request;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function confirmRequest(requestID, userID, status) {
    try {
        const userRequest = await UserRequest.findOne({requestID: requestID, userID: userID});
        if (!userRequest) {
            throw new Error('Request not found');
        }
        if (userRequest.status !== 'Pending') {
            throw new Error('Request already confirmed by user');
        }
        const request = await Request.findOne({_id: requestID});
        console.log(request);
        if (!request) {
            throw new Error('Request not found');
        }
        if (request.status !== 'Waiting') {
            throw new Error('Request already confirmed');
        }
        userRequest.status = status;
        await userRequest.save();
        if (status === 'Accepted') {
            const pendingRequests = await UserRequest.find({requestID: requestID, status: 'Pending'});
            if (pendingRequests.length === 0) {
                request.status = 'Pending';
                await request.save();
            }
        }
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    createRequest,
    confirmRequest,
}
