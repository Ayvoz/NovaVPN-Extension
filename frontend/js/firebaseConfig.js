// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoY1qWXDW8cZ22SxufIwP5cWq8S-aQvqY",
  authDomain: "novavpn-ex.firebaseapp.com",
  projectId: "novavpn-ex",
  storageBucket: "novavpn-ex.firebasestorage.app",
  messagingSenderId: "425744438409",
  appId: "1:425744438409:web:f94307996a63b3df1c6258",
  measurementId: "G-H40Y1HBS8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);