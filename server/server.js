const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const dbConnect = require('./config/dbconnect');
const route = require('./routes/index');

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
dbConnect();
route(app);

app.use('/', (req, res) => {
    res.send('Welcome to my BookStore!');
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
