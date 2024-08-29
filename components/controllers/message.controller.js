const Message = require('../models/message.model');
const User = require('../models/user.model');
const Query = require('../queries/message.query');

const send = async (req, res) => {
    try {
        if (!req.body.receiverId) {
            return res.status(400).json({ msg: 'receiverId is required' });
        }
        const receiver = await User.findById(req.body.receiverId);
        if (!receiver) {
            return res.status(404).json({ msg: 'Receiver not found' });
        }
        const message = new Message({
            sender: req.user._id,
            receiver: receiver._id,
            content: req.body.content,
        });

        await message.save();

        res.status(200).json(message);
        
        // console.log("A message sent!");
        global.io.to(global.users[receiver._id]).emit('receiveMessage', message);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while sending the message",
            error: err.message,
         });
    }
}

const inbox = async (req, res) => {
    try {
        const limit = 100;
        const skip = req.params.skip ? parseInt(req.params.skip) : 0;
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.id },
                { sender: req.params.id, receiver: req.user._id },
            ],
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
        
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while retrieving messages",
            error: err.message,
         });
    }
}

const lastMessages = async (req, res) => {
    try {
        res.status(200).json(await Query.getLastMessages(req.user._id));
    }
    catch (err) {
        res.status(500).json({ 
            msg: "An error occurred while retrieving users",
            error: err.message,
         });
    }
}

module.exports = {
    send,
    inbox,
    lastMessages,
};