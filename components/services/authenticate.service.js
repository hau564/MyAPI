const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.AUTH_KEY);
        const user = await User.findOne({ _id: data._id });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).send({ msg: 'Not authorized to access this resource' });
    }
}

module.exports = {
    authenticate
};