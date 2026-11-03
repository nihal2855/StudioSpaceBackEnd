
import express from "express";

import {
    createBooking,
    getMyBookings,
    getHostBookings,
    updateBookingStatus,
    cancelMyBooking,
} from "../controllers/booking.controller.js";

import { verifyAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new booking
router.post("/", verifyAuth, createBooking);

// Get creator's bookings
router.get("/my-bookings", verifyAuth, getMyBookings);

// Get host's incoming bookings
router.get("/host-bookings", verifyAuth, getHostBookings);

// Update booking status
router.patch("/:id/status", verifyAuth, updateBookingStatus);

// Cancel creator's own pending booking
router.patch("/:id/cancel", verifyAuth, cancelMyBooking);

export default router;
