const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
    {
        Ho: {
            type: String,
            required: true,
        },
        Ten: {
            type: String,
            required: true,
        },
        NgaySinh: {
            type: Date,
        },
        Phai: {
            type: String,
            enum: {
                values: ['male', 'female', 'other', 'unknown'],
                massage: '{VALUE} is not supported',
            },
            // required: true,
        },
        DiaChi: {
            type: String,
            // required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        DienThoai: {
            type: String,
            // validate: {
            //     validator: (DienThoai) => DienThoai.length > 9,
            //     massage: 'Phone number is incorrect format'
            // },
            // required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        ChucVu: {
            type: String,
            default: 'user',
        },
        password: {
            type: String,
            required: true,
        },
        // cart: {
        //     type: Array,
        //     default: [],
        // },
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product', // Tham chiếu đến collection 'Product'
                },
                quantityCart: Number,
                selected: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
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
