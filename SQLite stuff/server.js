"use strict"
// server js

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('Flashcards.db');

const express = require('express');
const port = 57443; // you need to put your port number here

const APIrequest = require('request');
const http = require('http');

const APIkey = 'AIzaSyBmy2oxvsm784oHnFrBT50Slm5T3yYAJLw';
// const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey;

function translateHandler(req, res, next) {
    let url = req.url;
    let qObj = req.query;
    let reqObj = {
      "source": "en", // User can't change language settings from browser -- Eng -> anything
      "target": "ko", //can be any language here from their list
      "q": qObj.english
    };

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


const app = express();
app.use(express.static('public'));  // can I find a static file?
// Method: 'GET'
app.get('/translate', translateHandler);   // if not, go next
app.use( fileNotFound );            // otherwise not found
// Method: 'POST'
app.post('/store', saveFlashcard);
app.use( fileNotFound );

app.listen(port, function (){console.log('Listening...');} );



/***** Requests to the datdabase ****/

function dumpDB() {
    db.all ( 'SELECT * FROM Flashcards', dataCallback);
    function dataCallback( err, data ) {console.log(data)}
}

// onclick function
function saveFlashcard(req, res, next){
  let qObj = req.query;
  let input = qObj.english;
  let output = qObj.korean;
  if(qObj != undefined){
    let cmdStr = 'INSERT into Flashcards(userid,input,output,num_seen,num_correct) VALUES(1,?,?,0,0)';
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
