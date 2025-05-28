const firebaseAdmin = require('firebase-admin');
require('dotenv').config(); // Load environment variables from .env file

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./novavpn-ex-firebase-adminsdk-fbsvc-f8d8093b63.json');  // Path to your service account file

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://novavpn-ex-default-rtdb.asia-southeast1.firebasedatabase.app/',  // Realtime Database URL
});

module.exports = { firebaseAdmin };
