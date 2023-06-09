const dotenv = require('dotenv');
dotenv.config();




// app initialization
const express = require('express');
const app = express();


// session configuration
const session = require('express-session');
app.use(
    session({
        cookie: {
            // httpOnly: true,
            // secure: true,
            // sameSite: true,
            maxAge: 500 * 60 * 1000,
            // expires: 5 * 60 * 1000,
        },
        resave: true,
        saveUninitialized: true,
        secret: 'secret',
        secure: true,
    })
);

// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ejs view engine
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/../views'));




// ugle-auth functions
const ugle_auth = require(`${__dirname}/../index.js`);
ugle_auth.connectToDatabase(`${__dirname}/database.db`, (err, dtb) => {
    if (err) {
        console.error(err.message);
    } else {


        // formatting database
        ugle_auth.formatDatabase(dtb, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.info('database formatted');
            }
        });


        // creating default admin account
        args = {
            'email': process.env.ADMIN_EMAIL,
            'password': process.env.ADMIN_PASSWORD,
            'created_by': 0
        };
        ugle_auth.createAdmin(dtb, args, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.info('default admin created');
            }
        });


        // activating preset routing - this is what the test is for
        ugle_auth.routes(app, dtb);


        // custom routing
        app.get('/', (req, res) => {
            res.render('test-views/homepage', {
                query: req.query,
                session: req.session
            });
        });

        app.get('/account/home', (req, res) => {
            res.render('test-views/account-home', {
                query: req.query,
                session: req.session
            });
        });

        app.get('/admin/portal', (req, res) => {
            res.render('test-views/account-home', {
                query: req.query,
                session: req.session
            });
        });

        app.get('/debug/session', (req, res) => {
            res.send(req.session);
            res.end();
        });

        app.get('/debug/auth', (req, res) => {
            ugle_auth.allUsers(dtb, (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    res.send(data);
                    res.end();
                }
            });
        });

        app.get('/debug/archive', (req, res) => {
            dtb.all('SELECT * FROM auth_archive;', [], (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    res.send(data);
                    res.end();
                }
            });
        });

        app.get('/debug/log', (req, res) => {
            dtb.all('SELECT * FROM auth_log;', [], (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    res.send(data);
                    res.end();
                }
            });
        });


        // listening on development port
        app.listen(3000);
        console.log('listening on port 3000, begin manual testing here -> http://localhost:3000');

    }
});