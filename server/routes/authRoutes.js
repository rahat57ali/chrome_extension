// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Dummy route to test
router.get('/test', (req, res) => {
  res.send('Auth route working');
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
