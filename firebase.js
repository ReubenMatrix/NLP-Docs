// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDznlRdkZFDfNfh9Rd3j_VFWtru9KMZEUc",
  authDomain: "docs-d87cf.firebaseapp.com",
  projectId: "docs-d87cf",
  storageBucket: "docs-d87cf.appspot.com",
  messagingSenderId: "418279955117",
  appId: "1:418279955117:web:513ce987be649836458424"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
