// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnNqgi9lf7IK_UNTf4Gnk59n15I3Oj8pM",
  authDomain: "nectar-og-r3-cafe-menu.firebaseapp.com",
  projectId: "nectar-og-r3-cafe-menu",
  storageBucket: "nectar-og-r3-cafe-menu.firebasestorage.app",
  messagingSenderId: "883361803393",
  appId: "1:883361803393:web:d5ffd91467a001a55ff180",
  measurementId: "G-PKLYJP2PFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
