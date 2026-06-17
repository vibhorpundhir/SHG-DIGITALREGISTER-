import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgQRy6CfULEltXEF-sovQAPKgeFrocH0Q",
  authDomain: "shg-digital-register.firebaseapp.com",
  projectId: "shg-digital-register",
  storageBucket: "shg-digital-register.firebasestorage.app",
  messagingSenderId: "363406057822",
  appId: "1:363406057822:web:ceeb226f2feb101109efcf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log("Connecting to Firestore...");
    const querySnapshot = await getDocs(collection(db, "gram_panchayats"));
    console.log("Success! Connected to Firestore. Found", querySnapshot.size, "documents in 'gram_panchayats' collection.");
  } catch (error) {
    console.error("Firebase connection failed:");
    console.error(error.message);
  }
}

testFirebase();
