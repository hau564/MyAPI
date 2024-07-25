const express = require('express');
const router = express.Router();

const upload = require('../services/multer.js');
const { authenticate } = require('../services/authenticate.service.js');
const { register, login, confirm, update, updateAvatar } = require('./auth.controller.js');


router.post('/register', register);
router.post('/login', login);
router.get('/confirm/:token', confirm);

router.get('/profile', authenticate, (req, res) => {
    res.json(req.user.privateView());
});

router.put('/profile', authenticate, update);
router.put('/profile/avatar', authenticate, upload.single('avatar'), updateAvatar);


module.exports = router;