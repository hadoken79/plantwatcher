const express = require('express'),
    //expressHandlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    routing = require('./routes'),
    session = require('express-session'),
    path = require('path'),
    webSocketServer = require('ws').Server,
    helmet = require('helmet'),
    rateLimit = require('express-rate-limit'),
    db = require('./services/dbService');
//bot = require('./services/botService');

require('dotenv').config();

const port = process.env.PORT || 3000;
const server = express();

//basic http-header protection
server.use(helmet());

// const sessionToLocalsCopy = (req, res, next) => {
//     res.locals.isLoggedIn = req.session && req.session.isLoggedIn;
//     next();
// };

//protection against bruteforce on login
// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minuten
//     max: 100,
// });

server.use(
    session({
        secret: process.env.SESSION_SECRET || 'SSSSssssshhhhhhh!',
        saveUninitialized: true,
        resave: false,
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 0,
    })
);

//server.use(sessionToLocalsCopy);
server.use(express.static(path.join(__dirname, 'dist'))); //used to deliver "static" files to client. ignore css/js/img prefix in dist
server.use(express.static(path.join(__dirname, 'dist/assets')));
//server.use(express.static(path.join(__dirname, 'node_modules'))); // für only used if files are referenced directly from modules folder.
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
//server.use('/settings', loginLimiter);
server.use('/', routing);
//server.use(loggerMiddleware);

//definitions for template engine
//server.set('viewDir', path.join(__dirname, 'views'));
//server.set('view engine', 'html');

//template Engine

// server.engine(
//     'html',
//     expressHandlebars({
//         defaultLayout: false,
//         extname: 'html',
//         partialsDir: 'views/partials',
//         //helpers: require('./handlebars-helpers'), //to use "helpers-logic in html also with handlebars"
//     })
// );

db.connectDB();

server.listen(port, () => {
    console.log(
        `Server now listening at Port ${port} running in ${process.env.NODE_ENV} mode`
    );
});




//websocket-server to connect with client. communication over port 8080. needs to be maped in container
let wss = new webSocketServer({ port: 8080 });
//wss.setMaxListeners(1000);

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`received: ${message}`);
    });
    ws.on('close', () => {
        console.log('socket-connection closed');
        //setTimeout(connect, 5000); //re-connect after 5 seconds
    });

    module.exports.sendMsg = (msg) => {
        ws.send(msg);
    };

});

