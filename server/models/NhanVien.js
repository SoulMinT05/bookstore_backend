const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const NhanVienSchema = new mongoose.Schema(
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
        passwordChangedAt: {
            type: String,
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
NhanVienSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hashSync(this.password, salt);
});

// Check req.body.password is same password in DB
// password: req.body.password
NhanVienSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password);
    },
};

//Export the model
module.exports = mongoose.model('NhanVien', NhanVienSchema);
