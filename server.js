const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

const dbConnect = require('./config/dbconnect');
const route = require('./routes/index');

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5731', // Cho phép yêu cầu từ localhost:3000
    }),
);

const port = process.env.PORT || 3001;

// app.use(bodyParser.json()); // Để phân tích cú pháp JSON
app.use(bodyParser.json({ limit: '10mb' })); // Giới hạn cho JSON
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
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
