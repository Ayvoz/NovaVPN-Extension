// Import the necessary Firebase SDK functions
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDoY1qWXDW8cZ22SxufIwP5cWq8S-aQvqY",
  authDomain: "novavpn-ex.firebaseapp.com",
  projectId: "novavpn-ex",
  storageBucket: "novavpn-ex.appspot.com",
  messagingSenderId: "425744438409",
  appId: "1:425744438409:web:f94307996a63b3df1c6258",
  measurementId: "G-H40Y1HBS8G",
  databaseURL: "https://novavpn-ex-default-rtdb.asia-southeast1.firebasedatabase.app/"  // Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const database = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Example: Writing session data to Realtime Database
function writeSessionData(userId, serverIp, startTime) {
  const sessionData = {
    user_id: userId,
    server_ip: serverIp,
    start_time: startTime,
    status: 'active',  // Session status (active, inactive)
  };

  // Write session data to the Realtime Database
  set(ref(database, 'sessions/' + userId), sessionData)
    .then(() => {
      console.log('Session data written successfully');
    })
    .catch((error) => {
      console.error('Error writing session data:', error);
    });
}

// Example: Sign up user with email and password
function signUpWithEmailPassword(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      console.log('User signed up:', user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error during sign-up:', errorCode, errorMessage);
    });
}

// Example: Sign in user with email and password
function signInWithEmailPassword(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user;
      console.log('User signed in:', user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error during sign-in:', errorCode, errorMessage);
    });
}

export { writeSessionData, signUpWithEmailPassword, signInWithEmailPassword };
