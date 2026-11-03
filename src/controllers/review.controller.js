
import { ObjectId } from "mongodb";
import { getReviewsCollection } from "../models/review.model.js";
import { getBookingsCollection } from "../models/booking.model.js";
import { getStudiosCollection } from "../models/studio.model.js";

// Get all reviews of a specific studio (Public)
export const getStudioReviews = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
        }

        const studioId = new ObjectId(id);

        const studio = await getStudiosCollection().findOne({
            _id: studioId,
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: "Studio not found",
            });
        }

        const reviews = await getReviewsCollection()
            .find({ studioId })
            .sort({ createdAt: -1 })
            .toArray();

        const totalReviews = reviews.length;

        const averageRating =
            totalReviews > 0
                ? Number(
                    (
                        reviews.reduce(
                            (total, review) => total + review.rating,
                            0
                        ) / totalReviews
                    ).toFixed(1)
                )
                : 0;

        return res.status(200).json({
            success: true,
            message: "Studio reviews retrieved successfully",
            data: {
                averageRating,
                totalReviews,
                reviews,
            },
        });
    } catch (error) {
        console.error("Get Studio Reviews Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve studio reviews",
        });
    }
};


// Create a review (Private - Completed booking required)
export const createStudioReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5",
            });
        }

        if (
            typeof comment !== "string" ||
            !comment.trim() ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a review comment (maximum 1000 characters)",
            });
        }

        const studioId = new ObjectId(id);

        const studio = await getStudiosCollection().findOne({
            _id: studioId,
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: "Studio not found",
            });
        }

        // Find a completed booking made by this user for this studio
        const completedBooking = await getBookingsCollection().findOne({
            studioId,
            creatorId: req.user.id,
            status: "Completed",
        });

        if (!completedBooking) {
            return res.status(403).json({
                success: false,
                message: "You can review this studio only after completing a booking",
            });
        }

        // One review per completed booking
        const existingReview = await getReviewsCollection().findOne({
            bookingId: completedBooking._id,
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this booking",
            });
        }

        const newReview = {
            studioId,
            bookingId: completedBooking._id,

            reviewerId: req.user.id,
            reviewerName: req.user.name || "StudioSpace User",
            reviewerEmail: req.user.email,
            reviewerImage: req.user.image || "",

            rating: numericRating,
            comment: comment.trim(),

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await getReviewsCollection().insertOne(newReview);

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: {
                ...newReview,
                _id: result.insertedId,
            },
        });
    } catch (error) {
        console.error("Create Studio Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit review",
        });
    }
};
