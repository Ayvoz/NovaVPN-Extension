const { firebaseAdmin } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Handle User Sign-Up
exports.signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Create user with Firebase Authentication
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password
    });

    // Generate JWT token for the new user
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email },
      process.env.JWT_SECRET, // Secret key for JWT token
      { expiresIn: '1h' } // Set token expiry (1 hour)
    );

    res.status(201).json({ token, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Handle User Sign-In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user by email using Firebase Authentication
    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);

    // Generate JWT token for the signed-in user
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email },
      process.env.JWT_SECRET, // Secret key for JWT token
      { expiresIn: '1h' } // Set token expiry (1 hour)
    );

    res.status(200).json({ token, message: 'User signed in successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Google Sign-In
exports.googleSignIn = async (req, res) => {
  const { idToken } = req.body; // Get Google ID Token from frontend

  try {
    // Verify the Google ID Token
    const ticket = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email } = ticket;

    // Generate JWT token for the authenticated user
    const token = jwt.sign(
      { uid, email },
      process.env.JWT_SECRET, // Secret key for JWT token
      { expiresIn: '1h' } // Set token expiry (1 hour)
    );

    res.status(200).json({ token, message: 'User signed in with Google' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
