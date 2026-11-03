
import { MongoClient } from "mongodb";

let client;
let db;

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MONGODB_URI is missing");
        }

        client = new MongoClient(uri);

        await client.connect();

        db = client.db(process.env.DB_NAME || "studiospace");

        console.log("MongoDB Connected Successfully");

        return db;
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        throw error;
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error("Database is not connected");
    }

    return db;
};
