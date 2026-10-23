```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

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

// Export Authentication and Firestore for the website
export const db = getFirestore(app);
export const db = getFirestore(app);

// Initialize Analytics only when supported
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch((error) => {
      console.warn("Firebase Analytics unavailable:", error);
    });
}

export default app;
```
