// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require("../controllers/authController");
const jwt = require('jsonwebtoken');


// Dummy route to test
router.get('/test', (req, res) => {
  res.send('Auth route working');
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
// router.get('/auth/google', authController.googleAuth)
// router.get('/auth/google/callback', authController.googleCallback);

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Generate JWT after successful Google auth
    const { generateToken } = require('../utils/jwt');

    const token = generateToken({
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });


    // Send token as a redirect for Chrome extension to grab
    const extensionId = process.env.EXTENSION_ID;
    res.redirect(`chrome-extension://${extensionId}/oauth-success.html?token=${token}`);

  }
);



module.exports = router;
