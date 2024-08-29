const User = require('../models/user.model.js');
// auth key
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail, sendResetPasswordEmail } = require('../services/email.service.js');

const register = async (req, res) => {
    try {
        console.log("Register: ", req.body);
        const {email, password} = req.body;
        const userExisted = await User.findOne({ email });
        if (userExisted) {
            return res.status(400).json({msg: 'User already exist'});
        }
        
        const user = new User(req.body);
        const token = jwt.sign({ id: user._id }, process.env.AUTH_KEY, { expiresIn: '1h' });
        sendConfirmationEmail(email, token);
        await user.save();
        res.status(201).json({msg: 'Confirmation email has been sent'});
    }
    catch (err) {
        res.status(400).json({error: err.message, msg: 'Failed to register'});
    }
};

const confirm = async (req, res) => {
    try {
        const token = req.params.token;
        const decoded = jwt.verify(token, process.env.AUTH_KEY);
        
        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).send('Invalid token');
    
        user.isVerified = true;
        await user.save();
    
        res.status(200).send('Email confirmed');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
}

const login = async (req, res) => {
    try {
        console.log("Login: ", req.body);
        const { email, password } = req.body;
        const user = await User.findOne({ email});
        if (!user) {
            return res.status(404).json({msg: 'User not exist'});
        }
        if (!user.isVerified) {
            return res.status(401).json({msg: 'Email not verified'});
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).send({msg: 'Password incorrect'});
        }
        const token = jwt.sign({ _id: user._id }, process.env.AUTH_KEY);
        res.status(200).json({ token, user: user.privateView() });
    }
    catch (err) {
        res.status(400).json({error: err, msg: 'Failed to login'});
    }
}

const update = async (req, res) => {
    try {
        console.log("Update profile: ", req.body);
        // console.log(req.headers.authorization);
        const user = req.user;
        user.update(req.body);
        await user.save();
        res.status(200).json(user.privateView());
    } catch (err) {
        res.status(400).json({msg: 'Failed to update profile'});
    }
}


const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const updateAvatar = async (req, res) => {
    try {
        if (!req.user) {
          return res.status(404).json({msg: 'User not found'});
        }
        
        if (!req.file) {
          return res.status(400).json({msg: 'No file uploaded'});
        }

        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: req.user._id.toString(),
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const data = await s3.upload(params).promise();
        
        res.status(200).send({
          msg: 'Avatar updated',
          url: data.Location
        });
      } catch (err) {
        res.status(500).send({error: err, msg: 'Failed to update avatar'});
      }
};

const forgotPassword = async (req, res) => {
    try {
        console.log("Forgot password: ", req.body);
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({msg: 'User not found'});
        }

        const newPassword = Math.random().toString(36).slice(-8);
        user.password = newPassword;
        await user.save();
        sendResetPasswordEmail(email, newPassword);
        res.status(200).json({msg: 'Password reset email has been sent'});
    }
    catch (err) {
        res.status(400).json({msg: 'Failed to reset password', error: err});
    }
}

const resetPassword = async (req, res) => {
    try {
        console.log("Reset password: ", req.body);
        const user = req.user;

        const { oldPassword, newPassword } = req.body;
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({msg: 'Password incorrect'});
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({msg: 'Password reset'});
    }
    catch (err) {
        res.status(400).json({msg: 'Failed to reset password', error: err});
    }
}

module.exports = {
    register,
    login,
    confirm,
    update,
    updateAvatar,
    forgotPassword,
    resetPassword
};