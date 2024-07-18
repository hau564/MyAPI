const User = require('../models/user.model');
// auth key
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const {email, password} = req.body;
    try {
        const userExisted = await User.findOne({ email });
        if (userExisted) {
            return res.status(400).send('User already exist');
        }
        const user = new User(req.body);
        await user.save();
        res.status(201).send('Success');
    }
    catch (err) {
        res.status(400).send(err);
    }
};



const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email});
        if (!user) {
            return res.status(404).send('User not exist');
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).send('Password incorrect');
        }
        const token = jwt.sign({ _id: user._id }, process.env.AUTH_KEY);
        res.status(200).json({ token });
    }
    catch (err) {
        res.status(400).send(err);
    }
}




const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const data = jwt.verify(token, process.env.AUTH_KEY);
        const user = await User.findOne({ _id: data._id });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).send({ error: 'Not authorized to access this resource' });
    }
}

module.exports = {
    register,
    login,
    authenticateToken
};