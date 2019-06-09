"use strict"

// For server-browser
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('Flashcards.db');
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
// const port = 57443; // you need to put your port number here
const port = 52791;
const app = express();
const GoogleStrategy = require('passport-google-oauth20');
// const clID = '692094366203-oamg12e85mg7sbefgil9d9o7gmk8lr57.apps.googleusercontent.com';
// const clSecret = 'PEk0egsTSdvFi3mZ7Z1IeTkS';
const clID = '1042840075543-l87sl1mgc5hcovufs7ee5sh877mfd218.apps.googleusercontent.com';
const clSecret = 'cRaSQ_BkZ2CeHZNn9CNaqy5Z';

// googleLoginData
const googleLoginData = {
    clientID: clID,
    clientSecret: clSecret,
    callbackURL: '/auth/accepted'
  };

passport.use(new GoogleStrategy(googleLoginData, gotProfile));

// For server-api interaction
const APIrequest = require('request');
const http = require('http');
const APIkey = 'AIzaSyBmy2oxvsm784oHnFrBT50Slm5T3yYAJLw';
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey;
const fs = require("fs");

// Not sure if we'll still need these:
const keys = require('./config/keys');


let reqObj = {
      "source": "en", // User can't change language settings from browser -- Eng -> anything
      "target": "es", //can be any language here from their list
      "q": ["example phrase"]
    };

process.on('SIGINT', function() {
    db.all ( 'SELECT * FROM flashcards', dataCallback);
    function dataCallback( err, data ) {
    	db.close();
	process.exit(0);
    }
});

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
		// print it out as a string, nicely formatted
         	res.send(APIresBody.data.translations[0].translatedText);
//    	    	console.log("In Spanish: "+ APIresBody.data.translations[0].translatedText);
//    	    	console.log("\n\nJSON was:");
//    	    	console.log(JSON.stringify(APIresBody, undefined, 2));
        }
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
  // console.log("Google profile ", profile);
  let select = 'SELECT * FROM Users WHERE googleid = ?';
  let googleid = profile.id;
  let firstname = profile.name.givenName;
  let lastname = profile.name.familyName;
  // console.log(googleid, lastname, firstname);
  db.run(select, [googleid], (err, rows) => {
	if(err) {
		console.log("gotProfile error", err);
		// throw err;
	}
	if(!rows){
		let insert = 'INSERT INTO Users (googleid, firstname, lastname) VALUES(?, ?, ?)';
		db.run(insert, [googleid, firstname, lastname], insertCallback);
		let dbRowID = googleid;
		done(null, dbRowID);
	}
	else{
		let dbRowID = googleid;
		done(null, dbRowID);
	}
  });
  dumpDB();
}

passport.serializeUser((dbRowID, done) =>{
  done(null, dbRowID);
});

passport.deserializeUser((dbRowID, done) =>{
	let select = 'SELECT * FROM Users WHERE googleid = ?'; // TODO: unable to check properly
	db.get(select, [dbRowID], (err, row) => {
		if (err) {
		  console.log("deserializeUser error", err);
		  // throw err;
		}
		if(row){
			//console.log("inside deserializer",row);
			let user = {
				googleid: row.googleid,
				firstname: row.firstname,
				lastname: row.lastname,
        			rowID: 0
			};
			done(null, user);
		}
	})
});

function loginAuthenticated(req, res, next) {
        if(req.user){
                res.redirect('/lango.html');
        }
        else {
                next();
        }
}

function isAuthenticated(req, res, next) {
	if(req.user){
		next();
	}
	else {
		res.redirect('/login.html');
	}
}


/***** Requests to the datdabase ****/

function updateSeen(req, res, next){
	if(req.user.googleid != undefined){
		console.log("card id" + req.user.googleid);
		let userid = req.user.googleid;
		let seen = 0;
		const select = 'SELECT * FROM Flashcards WHERE userid = ?';
		db.all(select, [userid], (err, userData)=>{
			if(err) {
				console.log("updateSeen Error", err);
				// throw err;
			}
			if(userData) {
				let test = true;
				let i = 0;
				let spanish = '';
         			let english = '';
				let math = 0;
				let rows = userData;
				// console.log("userData: \n", userData);
				// console.log("rows[i]: \n", rows[i].num_correct);
         			while(i < rows.length) {
            				let score=(Math.max(1,5-rows[i].num_correct) + Math.max(1,5-rows[i].num_seen) + (5*((rows[i].num_seen-rows[i].num_correct)/(rows[i].num_seen + 1))));
					math = Math.floor(Math.random() * 15);
					console.log(math, score);
            				if(math <= score){
						rows[i].num_seen = rows[i].num_seen + 1;
						console.log("num_seen: ", rows[i].num_seen);
  						let update = 'UPDATE Flashcards SET num_seen = ? WHERE input = ?';
  						db.run(update, [rows[i].num_seen, english], (err) => {
							      if(err){
								      throw err;
							      }
                 					      req.user.rowID = rows[i].rowid;
							      console.log("Updated Seen");
							      console.log(rows[i]);
							      // res.json(rows[i]);
						  });
						res.json(rows[i]);
						break;
					}
					else{ i = i + 1; }
				}
				if(i >= rows.length){
					row[0].num_seen = row[0].num_seen + 1;
					console.log("num_seen: ", row[0].num_seen);
					let update = 'UPDATE Flashcards SET num_seen = ? WHERE input = ?';
                                	db.run(update, [row[0].num_seen, english], (err) => {
                                                if(err){
                                                        throw err;
                                                }
                                                req.user.rowID = rows[i].rowid;
                                                console.log("Updated Seen");
                                                console.log(rows[i]);
                                                // res.json(rows[i]);
                                        });
                                	res.json(rows[i]);
				}
			}
			// console.log("reached end of updateSeen");
			// res.json(userData[0]);
		});
	} else {
		console.log("id is undefined");
	}
}

function updateCorrect(req, res, next){
	if(req.user.rowID != 0){
		console.log("card id: " + req.user.rowID);
		let cardID = req.user.rowID;
		let correct = 0;
		const select = 'SELECT * FROM Flashcards WHERE rowid = ?';
		db.get(select, [cardID], (err, row)=>{
			if(err) {
				console.log("updateCorrect Error ", err);
				// throw err;
			}
			if(row) {
        correct = row.num_correct + 1;
        let update = 'UPDATE Flashcards SET num_correct = ? WHERE rowid = ?';
        db.run(update, [correct, cardID], (err) =>{
          if(err){
            console.log('Error updated correct');
          }
          else{
            console.log('Updated num_correct Successful');
            res.send();
          }
        });
			}
			res.send();
    });
	} else {
		console.log("id is undefined");
	}
}

function getCards(req, res) {
	if(req.user) {
		let select = 'SELECT * FROM Flashcards WHERE userid = ?';
		console.log(req.user.googleid);
		db.all(select, [req.user.googleid], (err, rows) => {
			if(err){
				console.log("getCards error", err);
				// throw err;
			}
			console.log("in getCards, ", rows);
			res.json(rows);
		});
	}
}

function getUser(req, res){
	if(req.user) {
    let select = 'SELECT * FROM Users WHERE googleid = ?';
    db.all(select, [req.user.googleid], (err, rows) => {
      if(err){
        console.log("getUsers error", err);
        throw err;
      }
      console.log("in getUsers, ", rows);
      res.json(rows);
    });
  }
}

function dumpDB() {
    db.all ( 'SELECT * FROM Flashcards', dataCallback);
    db.all( 'SELECT * FROM Users', dataCallback);
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
    let cmdStr = 'INSERT into Flashcards  VALUES(?,?,?,0,0)';
    db.run(cmdStr, [req.user.googleid, input, output], insertCallback);
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


// Let the mighty pipeline begin
app.use(cookieSession({
    maxAge: 6*60*60*1000,
    keys:['random string']
  })); // how long server remembers cookie (6 hrs), what is the key signature

app.use(passport.initialize());
app.use(passport.session());
//app.get('/lango.html', loginAuthenticated);
app.get('/*', express.static('public'));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/accepted', passport.authenticate('google'), function(req, res) {
        console.log('Logged in');
        res.redirect('/public/lango.html');
});

app.get('/public/*', isAuthenticated, express.static('.'));

app.use(express.static('public'));  // can I find a static file?
app.get('/getUser', isAuthenticated, getUser);
app.get('/getCards', isAuthenticated, getCards);
app.get('/updateSeen', isAuthenticated, updateSeen);
app.get('/updateCorrect', isAuthenticated, updateCorrect);
app.get('/translate', isAuthenticated, translateHandler);   // if not, go next
app.post('/store', isAuthenticated, saveFlashcard);
app.use( fileNotFound );

app.listen(port, function (){console.log('Listening...');} );
