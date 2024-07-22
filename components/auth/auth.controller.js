const User = require('../models/user.model');
// auth key
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../services/email.service.js');

const register = async (req, res) => {
    console.log("Register: ", req.body);
    const {email, password} = req.body;
    try {
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
    console.log("Login: ", req.body);
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email});
        if (!user) {
            return res.status(404).send('User not exist');
        }
        if (!user.isVerified) {
            return res.status(401).send('Email not verified');
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).send('Password incorrect');
        }
        const token = jwt.sign({ _id: user._id }, process.env.AUTH_KEY);
        res.status(200).json({ token, user: user.privateView() });
    }
    catch (err) {
        res.status(400).send(err);
    }
}

module.exports = {
    register,
    login,
    confirm
};