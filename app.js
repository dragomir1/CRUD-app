// require modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const moment = require('moment');

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.Promise = global.Promise;
// connect mongoose to mongodb
mongoose.connect('mongodb://localhost/db_quote');

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 1},
  quote: {type: String, required: true},
  stampdate: {type: Date, default: Date.now}
});

mongoose.model('User', UserSchema);
const User =  mongoose.model('User');

const error_messages = [];

// GET - POST REQUESTS
app.get('/', (req, res, next) => {
  context = {error: error_messages};
  res.render('index');
});

app.get('/quotes', (req, res, next) => {
  User.find({}, (err, users) => {
  if(err) {
    console.log(err, "there's been an error");
    context = {};
  } else {
    context = {user:users, moment:moment};
    res.render('quotes', context);
    }
  });
});

app.post('/quotes', (req, res, next) => {
  console.log("POST DATA", req.body);
  const user = new User({
    name: req.body.name,
    quote: req.body.quote
  });
  console.log(" adding a new user with a quote\n\n\n", user);
  user.save(function(err) {
    if(err){
      console.log(err);
      console.log("error when adding a user");
      res.render('index', {errors: user.errors})
    } else {
      console.log("succesfully added a user");
      res.redirect('/quotes');
    }
  })
});

// Overide CORS to give access to server from different clients.
app.use((req, res, next) => {
  res.header('Acess-Control-Allow-Origin', '*');
  res.header('Acess-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.header('Acess-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// export app module to server
module.exports = app;
