// I think that these are alright? Might be small errors, but as far as I understand it works
// - Not sure if we are supposed to save a local variable so that it is easier to read the values n such
// The way I have it written is:
// - retrieve and save the data from the DB to local variabels
// - can see and display the values from the local variables -- so that it is faster and doesn't have to wait for callbacks to finish
// - only communicates with the DB at login, or if there is a change to a flashcard, or addition of another flashcard

// Should create DB before running code

// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

// object so that we can manipulate the values in 'Flashcards.db'
const db = new sqlite3.Database('Flashcards.db'); // location of database

// variable for array of arrays
let table = [][]; // values of table: [][rowid, userid, input language, output language, times seen, times correct]
let saveIndex = 0; // to know which index u are saving to
let current = 0; // to know which card is currently being shown.
let num_users = 0;
let rowid = 0; // set to the last rowid in database -- to know what to set rowid to in local var

// Checks username/password and shows all cards for this user -- on the server
// returns the table of all variables, sets it into local variable.
function newUser(){
  // set a username and password to a userid using num_users -- idk this one

  // increments users -- same as userid (2nd user will be userid = 2)
  this.num_users += 1; // This is wrong, but idk how we track usernames n such
}

function login(){
  // function to check if valid username/password -- is this with React? not sure
  // sets a user value to the next index

  getRowId(); // sets rowid to the last index of the DB

  // getUserCards() method to display all the cards for this user
  let userid = getUserId(); // change this to be unique for each username? idk how
  this.table = getUserCards(userid);
  // from check username function wherever that is implemented ( not in this code )
  if(/*username and password is correct*/){
    return table[current][]; // first card to later fill into sections of the html/javascript for the browser
  }
  else{
    console.log('Error logging in...');
  }
}

// function to send request to API for the translation -- in this file or no?
function translate(){
  // sends API request, API callback returns translation text
  // set output of current flashcard to equal API response
}

function getRowId(){
  let cmdStr = 'SELECT * FROM Flashcards';
  db.all(cmdStr, arrayCallback);
}

// Should be another way to get userid with username and that stuff
function getUserId(){
  return 1; // later return function that gets userid
}

function getInput(){
  return document.getElementById('input').textContent;
}

function getOutput(){
  return document.getElementById('output').textContent;
}

function getSeen(){
  return this.table[this.current][4];
}

function getCorrect(){
  return this.table[this.current][5];
}

// button calls

// create new Flashcard
function save(){
  // create new flashcard
  userid = getUserId();
  input = getInput();
  output = getOutput();

  newRow = [this.rowid + 1, userid, input, output, 0, 0];
  this.table.push(newRow);

  // Below works properly when we assign userid to usernames n stuff -- in getUserId(), Should work with userid = 1
  newFlashcard(userid, input, output);

  // Should display a blank card after this
}

function startReview(){
  // Turns input html into <p> tags
  // Makes button for next and edit visible, start review and save not visible
  // displays this.table[current];
}

// from review view, go back to saving view
function edit(){
  // turns <p> tags back into input tags
  // Makes save and start review visible, next and edit not visible
  // displays blank card
}

// These do not change the actual translated text, but
// changes inLang to equal the input text -- of already saved flashcards.
function changeInput(){
  input = getInput();
  rowid = getRowId();
  // change local var
  this.table[this.current][2] = input;
  // change DB value
  updateInput(input, rowid);
}

// changes output to equal the translation text -- of already saved flashcards.
function changeOutput(){
  output = getOutput();
  rowid = getRowId();
  // change local var
  this.table[this.current][3] = output;
  // change DB value
  updateOutput(output, rowid);
}


// We probably can just display them in the order they were put in without shuffling
// -- so when we click next, it just goes to rowid + 1
// returns array of values of the next flashcard
function getNext(){
  new = this.current + 1;
  // check if new goes past number of rows
  if(new > this.table.length){
    new = 0; // rowid = 1
  }

  num_seen = this.table[this.current][4] + 1; // index for seen
  rowid = this.table[this.current][0];
  // update local variables
  this.current = new;
  this.table[this.current][4] = seen;
  // update DB seen value
  updateSeen(num_seen, rowid);

  return this.table[new]; // returns the next row, array of the values
}

// checks if input is correct -- Called when press enter in testing format
function isCorrect(){
  input = getInput(); // user input on flashcard when guessing
  output = getOutput(); // the correct translation

  if(input == output){
    num_correct = this.table[this.current][5] + 1;
    // update local variables
    this.table[this.current][5] = num_correct;
    // and update DB value
    rowid = getRowId();
    updateCorrect(num_correct, rowid);
  }
  else{
    print('You got it wrong dummy.');
  }
}





// Functions that interact with the DB

// Inserts empty flashcard, then updates
// function newFlashcard(input, output){
//   let cmdStr = 'INSERT into Flashcards(userid,input,output,num_seen,num_correct) VALUES(1,@0,@1,0,0)'; // change userid to the user's id and first value in VALUES(...)...
//   // idk how the @0 and @1 stuff works, but should put in the values -- I think it just uses input and output below in place of @0 and @1
//   db.run(cmdStr, input, output, insertCallback);
// }

// This works for a given userid if I am understanding the @ stuff correctly
function newFlashcard(userid, input, output){}
  let cmdStr = 'INSERT into Flashcards(userid,input,output,num_seen,num_correct) VALUES(@0,@1,@2,0,0)';
  db.run(cmdStr, userid, input, output, insertCallback);
}

// When creating a new flashcard, have to wait until insertcallback returns to update
function updateInputOutput(input, output){
  let cmdStr = 'UPDATE Flashcards SET input = '+input+' and output = '+output+'WHERE rowid = '+toString(rowid);
  db.run(cmdStr, errorCallback);
}

function updateInput(input, rowid){
  let cmdStr = 'UPDATE Flashcards SET input = '+input+'WHERE rowid = '+toString(rowid);
  db.run(cmdStr, errorCallback);
}

function updateOutput(output, rowid){
  let cmdStr = 'UPDATE Flashcards SET output = '+output+'WHERE rowid = '+toString(rowid);
  db.run(cmdStr, errorCallback);
}

// update function for seen & correct
function updateCorrect(num_correct, rowid){
  let cmdStr = 'UPDATE Flashcards SET num_correct = '+toString(num_correct)+'WHERE rowid = '+toString(rowid);
  db.run(cmdStr, errorCallback);
}

function updateSeen(num_seen, rowid){
  let cmdStr = 'UPDATE Flashcards SET num_seen = '+toString(num_seen)+'WHERE rowid = '+toString(rowid);
  db.run(cmdStr, errorCallback);
}

// get functions
// used to set rowid to last rowid in DB
/*
function getAll(){
  let cmdStr = 'SELECT * FROM Flashcards';
  return(db.all(cmdStr, arrayCallback));
}
*/

// call when loading in user's flashcard set, returns the table of flashcards
function getUserCards(userid){
  let cmdStr = 'SELECT * FROM Flashcards WHERE userid = '+toString(userid);
  return(db.all(cmdStr, user_arrayCallback));
}

// call when loading each flashcard by rowid, returns array with one flashcard
function getOne(rowid){
  let cmdStr = 'SELECT * FROM Flashcards WHERE rowid = '+toString(rowid);
  return(db.get(cmdStr, dataCallback)); // returns the array of the flashcard
}




// CALLBACK FUNCTIONS:
// sends callback to database, err = error if there is an error, else puts data into second variable
// in order of : {rowid INT, userid INT, input TEXT, response TEXT, num_seen INT, num_correct INT} -- rowid might be first or last, pretty sure it's first
// for entire table
function arrayCallback(err, arrayData){
  if(err){ console.log("error:",err, "\n"); }
  else{
    //console.log("array:", arrayData, "\n");
    this.rowid = arrayData.length;
    //return arrayData;
  }
}

function user_arrayCallback(err, user_arrayData){
  if(err){ console.log("error:",err, "\n"); }
  else{
    //console.log("array:", arrayData, "\n");
    return user_arrayData;
  }
}
// for individual row
function dataCallback(err, rowData){
  if(err){ console.log("error:",err, "\n"); }
  else{
    //console.log("got:", rowData, "\n");
    return rowData;
  }
}
// for insert new flashcard
function insertCallback(err){
  if(err){ console.log(err); }
  else{
    console.log("Successfully stored flashcard.")
    getRowId();
    updateInputOutput();
  }
}
// for updating flashcard
function errorCallback(err){
  if(err){ console.log("error:",err, "\n"); }
  else{ console.log("Flashcard has been updated."); }
}
