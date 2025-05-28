const { firebaseAdmin } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Sign-Up Route
exports.signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Create user using Firebase Authentication
    const userRecord = await firebaseAdmin.auth().createUser({ email, password });

    // Generate JWT token for the new user
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email }, // Payload
      process.env.JWT_SECRET, // JWT Secret from .env
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return the token to the frontend
    res.status(201).json({ token, message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sign-In Route
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user by email using Firebase Authentication
    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);

    // Generate JWT token for the signed-in user
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email }, // Payload
      process.env.JWT_SECRET, // JWT Secret from .env
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ token, message: 'User signed in successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
