const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        birthDay: {
            type: Date,
            // required: true,
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'other', 'unknown'],
                massage: '{VALUE} is not supported',
            },
            // required: true,
        },
        // address: {
        //     type: Array,
        //     default: [],
        // },
        address: {
            type: String,
            // required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            // validate: {
            //     validator: (phoneNumber) => phoneNumber.length > 9,
            //     massage: 'Phone number is incorrect format'
            // },
            // required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: 'user',
        },
        password: {
            type: String,
            required: true,
        },
        cart: {
            type: Array,
            default: [],
        },
        wishList: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Product',
            },
        ],
        isLocked: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        passwordChangedAt: {
            type: Date,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: String,
        },
    },
    {
        // _id: false,
        timestamps: true,
    },
);

// Hash password to DB
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hashSync(this.password, salt);
});

// Check req.body.password is same password in DB
// password: req.body.password
UserSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
    createPasswordChangeToken: function () {
        // Create data random
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Create hash and update data by hex
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
        return resetToken;
    },
};

//Export the model
module.exports = mongoose.model('DocGia', UserSchema);
