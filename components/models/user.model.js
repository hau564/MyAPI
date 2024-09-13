const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//env
require('dotenv').config();

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
        type: String,
    },
    avatarUrl: {
        type: String,
        default: process.env.DEFAULT_AVATAR
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
    return user;
};

userSchema.methods.privateView = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

userSchema.methods.updatableView = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    delete user._id;
    delete user.isVerified;
    delete user.email;
    return user;
};

userSchema.methods.update = function (data) {
    const updateFields = ['name', 'age', 'phone', 'description', 'interests'];
    for (let key in data) {
        if (updateFields.includes(key)) {
            this[key] = data[key];
        }
    }
}

module.exports = mongoose.model('User', userSchema);
