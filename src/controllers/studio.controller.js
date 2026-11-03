
import { getStudiosCollection } from "../models/studio.model.js";
import { ObjectId } from "mongodb";

// Create a new studio
export const createStudio = async (req, res) => {
    try {
        const {
            title,
            category,
            hourlyRate,
            securityDeposit,
            maxCapacity,
            location,
            imageUrl,
            amenities,
            overview,
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof category !== "string" ||
            !category.trim() ||
            hourlyRate === undefined ||
            typeof location !== "string" ||
            !location.trim() ||
            typeof imageUrl !== "string" ||
            !imageUrl.trim() ||
            typeof overview !== "string" ||
            !overview.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const studio = {
            title: title.trim(),
            category: category.trim(),
            hourlyRate: Number(hourlyRate),
            securityDeposit: Number(securityDeposit ?? 0),
            maxCapacity: Number(maxCapacity ?? 1),
            location: location.trim(),
            imageUrl: imageUrl.trim(),
            amenities: Array.isArray(amenities)
                ? amenities.filter((item) => typeof item === "string")
                : [],
            overview: overview.trim(),

            // Host identity comes from verified JWT
            hostId: req.user.id,
            hostName: req.user.name || "",
            hostEmail: req.user.email,

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (
            !Number.isFinite(studio.hourlyRate) ||
            studio.hourlyRate <= 0 ||
            !Number.isFinite(studio.securityDeposit) ||
            studio.securityDeposit < 0 ||
            !Number.isInteger(studio.maxCapacity) ||
            studio.maxCapacity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid price and capacity values",
            });
        }

        const result = await getStudiosCollection().insertOne(studio);

        return res.status(201).json({
            success: true,
            message: "Studio created successfully",
            data: {
                ...studio,
                _id: result.insertedId,
            },
        });
    } catch (error) {
        console.error("Create Studio Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create studio",
        });
    }
};


// Get studios created by the logged-in host
export const getMyStudios = async (req, res) => {
    try {
        const studios = await getStudiosCollection()
            .find({ hostId: req.user.id })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            success: true,
            message: "Your studios retrieved successfully",
            total: studios.length,
            data: studios,
        });
    } catch (error) {
        console.error("Get My Studios Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve your studios",
        });
    }
};


// Get a single studio by ID
export const getStudioById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
        }

        const studio = await getStudiosCollection().findOne({
            _id: new ObjectId(id),
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: "Studio not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Studio retrieved successfully",
            data: studio,
        });
    } catch (error) {
        console.error("Get Studio By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve studio",
        });
    }
};


// Get all studios
export const getAllStudios = async (req, res) => {
    try {
        const studios = await getStudiosCollection()
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            success: true,
            message: "All studios retrieved successfully",
            total: studios.length,
            data: studios,
        });
    } catch (error) {
        console.error("Get All Studios Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve studios",
        });
    }
};


// Update a studio (Owner only)
export const updateStudio = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
        }

        const allowedFields = [
            "title",
            "category",
            "hourlyRate",
            "securityDeposit",
            "maxCapacity",
            "location",
            "imageUrl",
            "amenities",
            "overview",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update",
            });
        }

        // Validate text fields
        for (const field of [
            "title",
            "category",
            "location",
            "imageUrl",
            "overview",
        ]) {
            if (updates[field] !== undefined) {
                if (
                    typeof updates[field] !== "string" ||
                    !updates[field].trim()
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid ${field}`,
                    });
                }

                updates[field] = updates[field].trim();
            }
        }

        // Validate numeric fields
        if (updates.hourlyRate !== undefined) {
            updates.hourlyRate = Number(updates.hourlyRate);

            if (
                !Number.isFinite(updates.hourlyRate) ||
                updates.hourlyRate <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Hourly rate must be greater than zero",
                });
            }
        }

        if (updates.securityDeposit !== undefined) {
            updates.securityDeposit = Number(updates.securityDeposit);

            if (
                !Number.isFinite(updates.securityDeposit) ||
                updates.securityDeposit < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Security deposit cannot be negative",
                });
            }
        }

        if (updates.maxCapacity !== undefined) {
            updates.maxCapacity = Number(updates.maxCapacity);

            if (
                !Number.isInteger(updates.maxCapacity) ||
                updates.maxCapacity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum capacity must be a positive integer",
                });
            }
        }

        if (updates.amenities !== undefined) {
            if (
                !Array.isArray(updates.amenities) ||
                !updates.amenities.every(
                    (item) => typeof item === "string"
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Amenities must be an array of strings",
                });
            }

            updates.amenities = updates.amenities
                .map((item) => item.trim())
                .filter(Boolean);
        }

        updates.updatedAt = new Date();

        // Only the owner can update their studio
        const result = await getStudiosCollection().findOneAndUpdate(
            {
                _id: new ObjectId(id),
                hostId: req.user.id,
            },
            {
                $set: updates,
            },
            {
                returnDocument: "after",
            }
        );

        if (!result) {
            const existingStudio = await getStudiosCollection().findOne({
                _id: new ObjectId(id),
            });

            if (!existingStudio) {
                return res.status(404).json({
                    success: false,
                    message: "Studio not found",
                });
            }

            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this studio",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Studio updated successfully",
            data: result,
        });
    } catch (error) {
        console.error("Update Studio Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update studio",
        });
    }
};


// Delete a studio (Owner only)
export const deleteStudio = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
        }

        // Only the owner can delete their studio
        const result = await getStudiosCollection().deleteOne({
            _id: new ObjectId(id),
            hostId: req.user.id,
        });

        if (result.deletedCount === 0) {
            const existingStudio = await getStudiosCollection().findOne({
                _id: new ObjectId(id),
            });

            if (!existingStudio) {
                return res.status(404).json({
                    success: false,
                    message: "Studio not found",
                });
            }

            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this studio",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Studio deleted successfully",
        });
    } catch (error) {
        console.error("Delete Studio Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete studio",
        });
    }
};
