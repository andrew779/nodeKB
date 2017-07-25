const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');





mongoose.connect(config.database,{
    useMongoClient: true,
});
let db = mongoose.connection;

//check connection
db.once('open', function(){
    console.log('Connected to MongoDB');
});

// check for DB errors
db.on('error', function(err){
    console.log(err);
});

// init app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Bring in models
let Article = require('./models/article');

// load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set public folder
app.use(express.static(path.join(__dirname,'public')));

// Express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express-messages middles ware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

app.get('/', (req,res) => {
    Article.find({}, function(error, articles){
        if (error){
            console.log(error);
        } else {
            res.render('index', {
                title: 'Hello',
                articles: articles
        });
        }        
    });    
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles',articles);
app.use('/users',users);


app.listen(3000, function(){
    console.log('Server started on port 3000...')
});