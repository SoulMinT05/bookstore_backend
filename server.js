const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

const dbConnect = require('./config/dbconnect');
const route = require('./routes/index');
const session = require('express-session');

const app = express();
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); // Đổi 'require-corp' -> 'credentialless'
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

app.use(
    cors({
        origin: process.env.URI_CLIENT,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Cho phép các phương thức cần thiết
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);
app.use(
    session({
        secret: process.env.GOOGLE_CLIENT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true },
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
