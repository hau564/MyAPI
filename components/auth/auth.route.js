const express = require('express');
const router = express.Router();
const { register, login, authenticateToken } = require('./auth.controller.js');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticateToken, (req, res) => {
    res.send(req.user);
});

module.exports = router;