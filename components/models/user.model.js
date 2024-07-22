const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false 
    },
    name: {
        type: String,
    },
    age: {
        type: Number,
    },
    phone: {
        type: String,
    },
    description: {
        type: String,
    },
    interests: {
        type: [String],
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.publicView = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    delete user.email;
    user.id = user._id;
    delete user._id;
    return user;
};

userSchema.methods.privateView = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    user.id = user._id;
    delete user._id;
    return user;
};

module.exports = mongoose.model('User', userSchema);