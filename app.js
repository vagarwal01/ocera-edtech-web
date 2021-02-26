// DATABASE CONNECTION
const connection = require('./model')


// ROUTES CONTROLLERS
const educatorController = require('./controllers/educators')
const adminController = require('./controllers/admin')


// BASIC
const express = require("express"),
    path = require('path'),
    bodyparser = require('body-parser'),
    app = express();
// Setting up environment
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
// app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))
global.__basedir = __dirname;


// SOCIAL LOGINS
require('dotenv').config()
const passport = require('passport')
require('./google-passport-setup')
require('./facebook-passport-setup')
const cookieSession = require('cookie-session')
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}));
// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());
const { createConnection } = require("net");
// Auth middleware that checks if the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login-signup');
}
// GOOGLE login
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
app.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login-signup'
}));
// FACEBOOK login
app.get('/facebook', passport.authenticate('facebook', { scope: 'email' }))
app.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login-signup'
}));



app.get('/', (req, res) => res.render('index'))
app.get('/about-us', (req, res) => res.render('about-us'))
app.get('/blogs', (req, res) => res.render('blogs'))
app.get('/blogs/title', (req, res) => res.render('blogPost'))
app.get('/courses', (req, res) => res.render('OEcontroller', {'msg': 'soon', 'page': 'Courses'}))
app.get('/career', (req, res) => res.render('OEcontroller', {'msg': 'soon', 'page': 'Career'}))
app.get('/learn-as-student', (req, res) => res.render('OEcontroller', {'msg': 'soon', 'page': 'Student'}))
app.get('/login-signup', (req, res) => {
    if(req.session.email)
        res.redirect('/be-an-educator/dashboard/home')
    // else if(req.session.admin)
    //     res.redirect('/admin/dashboard/educators')
    else {
        req.logout();
        req.session.name = ''
        req.session.courseId = ''    
        res.render('signin-signup')    
    }
})


// ROUTES
app.use('/be-an-educator', educatorController)
app.use('/admin', adminController)

app.get('/profile', isLoggedIn, function(req, res) {
    res.redirect('/be-an-educator/social-login')
});




// LOGOUT
app.get('/logout', function(req, res) {
    req.logout();
    req.session.admin = ''
    req.session.email = ''
    req.session.name = ''
    req.session.courseId = ''
    res.redirect('/');
});


// MIDDLEWARE
app.listen(process.env.PORT || 8000, () => {
    console.log(`App Started on PORT ${process.env.PORT || 8000}`);
});