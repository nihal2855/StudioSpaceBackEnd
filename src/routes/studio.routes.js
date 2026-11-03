
import express from "express";

import {
    createStudio,
    getMyStudios,
    getStudioById,
    getAllStudios,
    updateStudio,
    deleteStudio,
} from "../controllers/studio.controller.js";

import {
    getStudioReviews,
    createStudioReview,
} from "../controllers/review.controller.js";

import { verifyAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new studio (Private)
router.post("/", verifyAuth, createStudio);

// Get all studios (Public)
router.get("/", getAllStudios);

// Get logged-in user's studios (Private)
router.get("/my-studios", verifyAuth, getMyStudios);

// Get studio reviews (Public)
router.get("/:id/reviews", getStudioReviews);

// Submit a studio review (Private - Completed booking required)
router.post("/:id/reviews", verifyAuth, createStudioReview);

// Update a studio (Private - Owner only)
router.patch("/:id", verifyAuth, updateStudio);

// Delete a studio (Private - Owner only)
router.delete("/:id", verifyAuth, deleteStudio);

// Get single studio by ID (Public)
router.get("/:id", getStudioById);

export default router;
