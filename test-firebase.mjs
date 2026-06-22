import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {

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
