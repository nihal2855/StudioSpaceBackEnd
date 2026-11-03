import express from "express";
import { getDB } from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const db = getDB();

        await db.command({ ping: 1 });

        res.status(200).json({
            success: true,
            message: "StudioSpace API is running",
            database: "Connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

export default router;