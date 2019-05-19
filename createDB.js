// Globals
const sqlite3 = require("sqlite3").verbose();  // use sqlite
const fs = require("fs"); // file system

const dbFileName = "Flashcards.db";

// makes the object that represents the database in our code
// object that our Node program communicates with db software
const db = new sqlite3.Database(dbFileName);  // object, not database.

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming Flashcards.db
// When creating table, by default adds 'rowid' with 1, 2, ... -- to quickly access index
const cmdStr = 'CREATE TABLE Flashcards (userid INT, input TEXT, output TEXT, num_seen INT, num_correct INT)'
db.run(cmdStr,tableCreationCallback);

// Always use the callback for database operations and print out any
// error messages you get.
// This database stuff is hard to debug, give yourself a fighting chance.
function tableCreationCallback(err) {
  if (err) {
      console.log("Table creation error",err);
  }
  else {
    console.log("Database created");
	  db.close();
  }
}
