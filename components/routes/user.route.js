const express = require('express');
const router = express.Router();
const User = require('../models/user.model.js');

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user.publicView());
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;