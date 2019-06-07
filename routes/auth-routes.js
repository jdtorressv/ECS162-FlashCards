const router = require('express').Router();
const passport = require('passport');

// auth login and render login page
router.get('/login', (req, res) => {
  res.render('login.html');
});


// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
  })
);

// redirect route from google
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  //res.send(req.user);
  res.redirect('/lango.html');
});

// // auth logout
// router.get('/logout', (req, res) => {
  //   // handle with passport
  //   res.send('logging out');
  // });

module.exports = router;
