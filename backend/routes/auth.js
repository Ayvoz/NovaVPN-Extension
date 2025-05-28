const express = require('express');
const { signUp, signIn, googleSignIn } = require('../controllers/authController');

const router = express.Router();

// User Sign-Up Route
router.post('/signup', signUp);

// User Sign-In Route
router.post('/signin', signIn);

// Google Sign-In Route (Optional)
router.post('/google-signin', googleSignIn);

module.exports = router;
