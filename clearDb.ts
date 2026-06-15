import { getDb, closeDb } from "./src/lib/db.server.js";

async function clearDb() {
  try {
    const db = await getDb();
    await db.dropDatabase();
    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Failed to clear database:", error);
  } finally {
    await closeDb();
  }
}

clearDb();
