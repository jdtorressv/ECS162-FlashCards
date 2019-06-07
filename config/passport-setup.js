const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../')

passport.serializeUser((profile, done) =>{
  done(null, profile.id);
});

passport.deSerializeUser((id, done) =>{
  User.findById(id, (err, user) =>{
    done(null, user);
  });
})

// profile gives id, displayName, name(familyName, givenName), ...
passport.use(
  new GoogleStrategy({
    // options for the google strategy
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
  }, (accessToken, refreshToken, profile, done) => {
    // passport callback function
    // check if user already in db
    let select = 'SELECT * FROM Users WHERE googleid ='+profile.id;
    db.get(select, checkCallback)

  })
);

function checkCallback(err, rowData){
  if(err){
    console.log("Check Error: ", err); // no user yet
    // make a new user
    let insert = 'INSERT into Users VALUES(?, ?)';
    db.run(insert, [profile.id, profile.displayName], insertCallback)
    dumpDB();
    done(null, profile)
  }
  else {
    console.log("Retrived user data."); // already have user
    done(null, profile)
  }
}

function insertCallback(err){
  if(err){
    console.log('Error: ', err);
  }
  else{
    console.log('New user created.');
    dumpDB();
  }
}

function dumpDB() {
    db.all ( 'SELECT * FROM Users', dataCallback);
    function dataCallback( err, data ) {console.log(data)}
}
