const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
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
    authenticate
};