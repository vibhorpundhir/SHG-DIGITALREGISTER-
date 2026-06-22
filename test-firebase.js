import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
 
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
