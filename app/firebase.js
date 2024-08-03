// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ0cO7kxjAAzHh9i4Y2yo4THdKczEL_Ws",
  authDomain: "inventory-management-app-8e5bb.firebaseapp.com",
  projectId: "inventory-management-app-8e5bb",
  storageBucket: "inventory-management-app-8e5bb.appspot.com",
  messagingSenderId: "435028058750",
  appId: "1:435028058750:web:16c793f79b003f2160ee2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore= getFirestore(app)
export {app, firestore}