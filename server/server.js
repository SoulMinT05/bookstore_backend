const express = require('express');
require('dotenv').config();
const dbConnect = require('./config/dbconnect');
const route = require('./routes/index');

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dbConnect();
route(app);

app.use('/', (req, res) => {
    res.send('SERVER ONLINE');
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
