const { admin } = require('googleapis/build/src/apis/admin');
const Event = require('../models/event.model');
const Admin = require('../models/admin.model');
const Joined = require('../models/joined.model');
const Invitation = require('../models/invitation.model');

const acceptInvitation = async (req, res) => {
    try {
        const invitation = await Invitation.findOne({_id: req.params.id});
        if (!invitation) {
            return res.status(404).json({msg: 'Invitation not found'});
        }
        // console.log(invitation);
        // console.log(req.user);
        if (invitation.userID.toString() !== req.user._id.toString()) {
            return res.status(403).json({msg: 'Unauthorized to accept this invitation'});
        }
        const admin = await Admin.findOne({_id: invitation.adminID});
        const joined = new Joined({
            eventID: admin.eventID,
            userID: invitation.userID,
        });
        await joined.save();
        await Invitation.deleteOne({_id: invitation._id});
        res.status(200).json({joined});
    }
    catch (err) {
        res.status(400).json({error: err.message, msg: 'Failed to accept invitation'});
    }
}

module.exports = {
    acceptInvitation,  
};