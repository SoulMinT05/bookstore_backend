const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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
            required: true,
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'other', 'unknown'],
                massage: '{VALUE} is not supported',
            },
            // required: true,
        },
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
        password: {
            type: String,
            required: true,
        },
        wishList: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Sach',
            },
        ],
        isBlocked: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
        passwordChangedAt: {
            type: String,
        },
        passwordResetToken: {
            type: String,
        },
        passwordExpired: {
            type: String,
        },
    },
    {
        // _id: false,
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('NhanVien', userSchema);
