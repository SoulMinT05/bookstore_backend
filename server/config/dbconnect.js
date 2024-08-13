const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        const connect = mongoose.connect(process.env.MONGODB_URL);
    } catch (err) {
        console.log('DB connection is failed!!');
        throw new Error(err);
    }
};

module.exports = dbConnect;
