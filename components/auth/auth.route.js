const express = require('express');
const router = express.Router();
const { register, login, confirm } = require('./auth.controller.js');
const { authenticate } = require('../services/authenticate.service.js');

router.post('/register', register);
router.post('/login', login);
router.get('/confirm/:token', confirm);

router.get('/profile', authenticate, (req, res) => {
    res.json(req.user.privateView());
});

router.put('/profile', authenticate, async (req, res) => {
    try {
        const user = req.user;
        user.set(req.body);
        await user.save();
        res.status(200).json({msg: 'Profile updated'});
    } catch (err) {
        res.status(400).json({msg: 'Failed to update profile'});
    }
});

module.exports = router;