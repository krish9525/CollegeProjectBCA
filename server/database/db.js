import mongoose from "mongoose";

export const connectDb = async () => {
  const dbUri = process.env.DB;
  const fallbackUri = process.env.DB_LOCAL;

  try {
    await mongoose.connect(dbUri);
    console.log("Database Connected to DB");
  } catch (error) {
    console.error("Primary DB connection failed:", error.message);

    if (fallbackUri) {
      try {
        await mongoose.connect(fallbackUri);
        console.log("Database Connected to DB_LOCAL");
      } catch (fallbackError) {
        console.error("Fallback DB connection failed:", fallbackError.message);
      }
    } else {
      console.error("No fallback database URI configured.");
    }
  }
};
