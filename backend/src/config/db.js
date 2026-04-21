// import mongoose from "mongoose";

// export default async function connectDB() {
//   try {
//     const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

//     if (!mongoUri) {
//       console.error(
//         "MongoDB connection failed: missing MONGODB_URI in backend/.env.",
//       );
//       return;
//     }

//     await mongoose.connect(mongoUri);
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//   }
// }
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const ConnectionDB = async () => {
  try {
    console.log(process.env.MONGODB_URI, process.env.DATA_BASE_STRING);
    // Try MongoDB URI first (local), then DATA_BASE_STRING (Atlas)
    const mongoUri =  process.env.DATA_BASE_STRING;

    if (!mongoUri) {
      throw new Error(
        "MongoDB URI not found. Set MONGODB_URI or DATA_BASE_STRING in .env"
      );
    }

    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log(
      "\n📝 Fix: Install MongoDB locally or update connection string in .env"
    );
    process.exit(1);
  }
}

export default ConnectionDB;