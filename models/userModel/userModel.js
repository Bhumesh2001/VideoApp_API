const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [30, 'Name cannot exceed 30 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props =>
                `${props.value} is not a valid mobile number! Mobile number should be 10 digits.`,
        }
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
});

userSchema.index({ email: 1, mobileNumber: 1 });

userSchema.pre('save', async function (next) {
    const user = this;
    user.updatedAt = new Date();
    if (!user.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateProfilePicture = async function (url) {
    this.profilePicture = url;
    await this.save();
};

userSchema.methods.deactivate = async function () {
    this.isActive = false;
    await this.save();
};

userSchema.methods.activate = async function () {
    this.isActive = true;
    await this.save();
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;