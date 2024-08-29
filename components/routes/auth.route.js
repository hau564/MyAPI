const express = require('express');
const router = express.Router();

const upload = require('../services/multer.js');
const { authenticate } = require('../services/authenticate.service.js');
const authController = require('../controllers/auth.controller.js');


router.post('/signup', authController.register);
router.post('/login', authController.login);
router.get('/confirm/:token', authController.confirm);

router.get('/profile', authenticate, (req, res) => {
    res.json(req.user.privateView());
});

router.put('/profile', authenticate, authController.update);
router.put('/profile/avatar', authenticate, upload.single('avatar'), authController.updateAvatar);

router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password/', authenticate, authController.resetPassword)

module.exports = router;