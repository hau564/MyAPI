const Message = require('../models/message.model');
const mongoose = require('mongoose');

async function getLastMessages(userId) {
    try {
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId) },
                        { receiver: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { sentAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gt: ['$sender', '$receiver'] },
                            { sender: '$receiver', receiver: '$sender' },
                            { sender: '$sender', receiver: '$receiver' }
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $replaceRoot: { newRoot: '$lastMessage' }
            }
        ]);

        return messages;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    getLastMessages
};