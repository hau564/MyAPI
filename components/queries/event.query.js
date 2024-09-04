const Event = require('../models/event.model');

async function countJoined(eventID) {
    try {
        const count = await Event.aggregate([
            {
                $match: {
                    _id: eventID
                }
            },
            {
                $count: "count"
            }
        ]);
        return count[0].count;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

const Joined = require('../models/joined.model');
async function getJoinedEvents(userID) {
    try {
        const joined = await Joined.aggregate([
            {
                $match: {
                    userID: userID
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'eventID',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            {$unwind: '$event'},
            {
                $lookup: {
                    from: 'admins',
                    let: { eventID: '$eventID' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$eventID', '$$eventID'] },
                                        { $eq: ['$userID', userID] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'admin'
                },
            },
            {$unwind: {path: '$admin', preserveNullAndEmptyArrays: true}},
            {$project: {"event": 1, "admin": 1, "_id": 0, "joinedAt": 1}}
        ]);
        return joined;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

const Request = require('../models/request.model');
const UserRequest = require('../models/userRequest.model');
async function acceptRequest(request) {
    const userRequests = await UserRequest.find({requestID: request._id});
    for (let userRequest of userRequests) {
        const joined = new Joined({
            eventID: request.eventID,
            userID: userRequest.userID,
        });
        await joined.save();
    }
    await Request.deleteOne({_id: request._id});
    await UserRequest.deleteMany({requestID: request._id});
}

module.exports = {
    countJoined,
    getJoinedEvents,
    acceptRequest
};