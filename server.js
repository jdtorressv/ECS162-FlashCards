"use strict"
// server js

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('Flashcards.db');
const express = require('express');
const port = 57443; // you need to put your port number here
const APIrequest = require('request');
const http = require('http');
const APIkey = 'AIzaSyBmy2oxvsm784oHnFrBT50Slm5T3yYAJLw';
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey;
const app = express();

const clID = '';
const clSecret = '';

const googleLoginData = {
    clientID: clID,
    clientSecret: clSecret,
    callbackURL: '/auth/redirect'
  };

const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes.js');
const profileRoutes = require('./routes/profile-routes.js');
const passportSetup = require('./config/passport-setup.js');
const keys = require('./config/keys');

// cookie stage
app.use(cookieSession({
    maxAge: 6*60*60*1000,
    keys:[keys.session.cookieKey]
  })); // how long server remembers cookie (6 hrs), what is the key signature

app.use(passport.initialize());
app.use(passport.session());

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

let reqObj = {
      "source": "en", // User can't change language settings from browser -- Eng -> anything
      "target": "es", //can be any language here from their list
      "q": ""
    };

function translateHandler(req, res, next) {
    let requrl = req.url;
    let qObj = req.query;
    let list = requrl.split("=");
    let input = list[1];
    reqObj.q = input;

    getTranslation(res);

    if(res != undefined){
      //res.send();
    }
    else {
	    next();
    }
}


function getTranslation(res){
  function APIcallback(err, APIresHead, APIresBody) {
    // gets three objects as input
    if ((err) || (APIresHead.statusCode != 200)) {
        // API is not working
        console.log("Got API error");
        console.log(APIresBody);
    } else {
        if (APIresHead.error) {
    	     // API worked but is not giving you data
    	      console.log(APIresHead.error);
        } else {
          res.send(APIresBody.data.translations[0].translatedText);
    	    console.log("In Korean: "+ APIresBody.data.translations[0].translatedText);
    	    console.log("\n\nJSON was:");
    	    console.log(JSON.stringify(APIresBody, undefined, 2));
        }
    	// print it out as a string, nicely formatted
      }

  } // end callback function

  APIrequest(
    {
      url: url,
      method: "POST",
      headers: {"content-type": "application/json"},
      json: reqObj
    },
    APIcallback
  );

  // // put together the server pipeline
  // const app = express()
}

function fileNotFound(req, res){
  let url = req.url;
  res.type('text/plain');
  res.status(404);
  res.send('Cannot find '+url);
}

// Return code: 302
function gotProfile(accessToken, refreshToken, profile, done){
  console.log("Google profile ", profile);
  let insert = 'INSERT into Users VALUES(?, ?, ?)'

  db.run(insert, [profile.id, profile.givenName, profile.familyName], insertCallback);
  let dbRowID = 1;
  done(null, dbRowID);
}

function serializeUser(user, done){
  done(null, user.id);
}

function deSerializeUser(user, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
}

app.use(passport.initialize()); // initializes req for next passport stages
app.use(passport.session()); // attach user info to req in req.user. calls deserializeUser -- takes info out of database based on userID
app.get('/auth/google', passport.authenticate('google', { scope: /*profile*/ }));
passport.use(new GoogleStrategy(googleLoginData, gotProfile));

app.use(express.static('public'));  // can I find a static file?
// Method: 'GET'
app.get('/translate', translateHandler);   // if not, go next
// Method: 'POST'
app.post('/store', saveFlashcard);
app.use( fileNotFound );

app.listen(port, function (){console.log('Listening...');} );



/***** Requests to the datdabase ****/

function insertUser() {
  let insert = 'INSERT into Users VALUES(?, ?, ?)';
  db.get(insert, [googleid], function(err, rowData){
    if(rowData){
      Console.log("User exists");
      done(null);
    }
    else{
      Console.log("User inserted into databse");
      done(null);
    }
  })
}

function checkUser() {
  check = 'SELECT * FROM Users WHERE googleid ='+profile.id;
  db.get(check, function checkCallback(err, rowData){
    if(err){
      console.log("Check Error: "+err);
    }
    else if(rowData.length == 0){
      console.log("No user data");
    }
    else {
      console.log("Checked Correctly");
    }
  })
}

function dumpDB() {
    db.all ( 'SELECT * FROM Flashcards', dataCallback);
    function dataCallback( err, data ) {console.log(data)}
}

// onclick function
function saveFlashcard(req, res, next){
  let qObj = req.query;
  let requrl = req.url;
  let inout = requrl.split("=");
  let inp = inout[1].split("&");
  let input = inp[0];
  let output = inout[2];
  console.log(input, output);

  if(input != undefined){
    let cmdStr = 'INSERT into Flashcards  VALUES(1,?,?,0,0)';
    db.run(cmdStr, [input, output], insertCallback);
    res.send("Successfully inserted.");
  }
  else {
    next();
  }
}

function insertCallback(err){
  if(err){
    console.log('Error: ', err);
  }
  else{
    console.log('Successfully inserted.');
    dumpDB();
  }
}

// close on exiting the terminal
process.on('exit', function(){
  db.close();
});


/* FOR NEXT PART OF PROJECT
function getReview(){
  let cmdSTR = 'SELECT * FROM Flashcards WHERE userid = 1';
  db.all(cmdSTR, reviewCallback);
  newView(); // Sets view of first card
}

function reviewCallback(err, arrayData){
  if(err){
    console.log("Error: ", err);
  }
  else{
    console.log(arrayData);
    document.getElementById("tableValues").value = arrayData;
  }
}

function resetReview(){
  let cmdSTR = 'UPDATE Flaschards set num_seen = 0 and num_correct = 0';
  db.run(cmdStr, updateCallback);
}

// When user hits clicks next in review mode
function newView(){

}

// When hit enter in review mode
function isCorrect(){
  let inputText = document.getElementById("inputText").textContent; // the text saving the correct input -- different input tag
  let input = getInput();
  let num_correct = getNumCorrect();
  //let rowid = getRowId();

  if(input == inputText){
    //db.run('UPDATE FLashcards SET num_correct = ? WHERE rowid = ?', [num_correct + 1, rowid], updateCallback);
    db.run('UPDATE FLashcards SET num_correct = ? WHERE input = ?', [num_correct + 1, inputText], updateCallback);
  }
  else{
    // console.log("Incorrect Answer");
    document.getElementById("incorrect").textElement = "Incorrect Answer"; // Then set to display?
  }
}

function updateCallback(err){
  if(err){
    console.log("Error: ", err);
  }
  else{
    console.log("Successfully updated this flashcard.");
  }
}
*/
