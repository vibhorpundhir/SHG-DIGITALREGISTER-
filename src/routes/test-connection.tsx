import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export const Route = createFileRoute("/test-connection")({
  component: TestConnectionPage,
});

function TestConnectionPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  const addLog = (msg: string) => setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const runTest = async () => {
    setStatus("testing");
    setLogs([]);
    addLog("Starting Firebase connection test...");
    
    try {
      addLog("Attempting to write to 'connection_tests' collection...");
      const testCollection = collection(db, "connection_tests");
      
      // Use a timeout so it doesn't hang forever
      const writePromise = addDoc(testCollection, {
        timestamp: new Date().toISOString(),
        message: "Test write successful"
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firebase Timeout: Could not connect to Firestore after 10 seconds.")), 10000)
      );

      const docRef = await Promise.race([writePromise, timeoutPromise]) as any;
      addLog(`Write successful! Document ID: ${docRef.id}`);

      addLog("Attempting to read from 'connection_tests' collection...");
      const snap = await getDocs(testCollection);
      addLog(`Read successful! Found ${snap.docs.length} documents.`);

      addLog("Attempting to delete test document...");
      await deleteDoc(doc(db, "connection_tests", docRef.id));
      addLog("Delete successful! Cleanup complete.");

      setStatus("success");
      addLog("✅ All Firebase tests passed! Your database is properly configured and accessible.");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      addLog(`❌ ERROR: ${err.message}`);
      addLog(`Error Code: ${err.code}`);
      
      if (err.message.includes("Missing or insufficient permissions")) {
        addLog("DIAGNOSIS: Your Firestore Security Rules are blocking access. You need to update them to allow read/write.");
      } else if (err.code === "unavailable" || err.message.includes("offline")) {
        addLog("DIAGNOSIS: Cannot reach Firestore. Check your internet connection or if Firestore is enabled in your project.");
      } else {
        addLog("DIAGNOSIS: Please check the browser console for more details.");
      }
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto mt-10 bg-white rounded shadow text-black">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Diagnostics</h1>
      
      <p className="mb-4 text-gray-600">
        This page will test if your app can successfully communicate with Firebase Firestore.
      </p>

      <button 
        onClick={runTest}
        disabled={status === "testing"}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-6 disabled:opacity-50"
      >
        {status === "testing" ? "Testing..." : "Run Test"}
      </button>

      <div className="bg-gray-900 text-green-400 font-mono p-4 rounded min-h-[200px] whitespace-pre-wrap">
        {logs.length === 0 ? "Logs will appear here..." : logs.join("\n")}
      </div>
    </div>
  );
}
