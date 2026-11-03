
import "dotenv/config";

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { createStudioIndexes } from "./models/studio.model.js";
import { createBookingIndexes } from "./models/booking.model.js";

import studioRoutes from "./routes/studio.routes.js";
import healthRoutes from "./routes/health.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware

// Allow requests from any origin
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to StudioSpace API",
    });
});

// Health Check Route
app.use("/api/health", healthRoutes);

// Studio Routes
app.use("/api/studios", studioRoutes);

// Booking Routes
app.use("/api/bookings", bookingRoutes);

// Start Server
const startServer = async () => {
    try {
        // Connect MongoDB
        await connectDB();

        // Create Collection Indexes
        await createStudioIndexes();
        await createBookingIndexes();

        // Start Express Server
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`API available at http://127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
