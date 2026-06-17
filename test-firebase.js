import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgQRy6CfULEltXEF-sovQAPKgeFrocH0Q",
  authDomain: "shg-digital-register.firebaseapp.com",
  projectId: "shg-digital-register",
  storageBucket: "shg-digital-register.firebasestorage.app",
  messagingSenderId: "363406057822",
  appId: "1:363406057822:web:ceeb226f2feb101109efcf",
  measurementId: "G-9D4ZS000JH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Testing connection...");
  try {
    const docRef = await addDoc(collection(db, "connection_tests"), {
      timestamp: new Date().toISOString(),
      source: "node_script"
    });
    console.log("Success! Document written with ID: ", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Error adding document: ", e);
    process.exit(1);
  }
}

test();
