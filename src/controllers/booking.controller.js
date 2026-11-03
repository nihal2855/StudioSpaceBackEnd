
import { ObjectId } from "mongodb";
import { getBookingsCollection } from "../models/booking.model.js";
import { getStudiosCollection } from "../models/studio.model.js";

export const createBooking = async (req, res) => {
    try {
        const {
            studioId,
            bookingDate,
            startTime,
            endTime,
        } = req.body;

        // Validate required fields
        if (!studioId || !bookingDate || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Studio, booking date, start time and end time are required",
            });
        }

        // Validate MongoDB Studio ID
        if (!ObjectId.isValid(studioId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio ID",
            });
        }

        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking date format",
            });
        }

        const parsedDate = new Date(`${bookingDate}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== bookingDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking date",
            });
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format. Use HH:mm",
            });
        }

        // Calculate booking duration
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes <= startMinutes) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time",
            });
        }

        const totalHours = (endMinutes - startMinutes) / 60;

        // Find studio
        const studio = await getStudiosCollection().findOne({
            _id: new ObjectId(studioId),
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: "Studio not found",
            });
        }

        // Prevent booking own studio
        if (studio.hostId === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot book your own studio",
            });
        }

        const hourlyRate = Number(studio.hourlyRate);

        if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid studio hourly rate",
            });
        }

        const totalPrice = totalHours * hourlyRate;

        // Prevent overlapping confirmed bookings
        const overlappingBooking = await getBookingsCollection().findOne({
            studioId: studio._id,
            bookingDate,
            status: "Confirmed",
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });

        if (overlappingBooking) {
            return res.status(409).json({
                success: false,
                message: "This studio is already booked for the selected time. Please choose another time.",
            });
        }

        // Create booking document
        const newBooking = {
            studioId: studio._id,
            studioTitle: studio.title,

            creatorId: req.user.id,
            creatorEmail: req.user.email,

            hostId: studio.hostId,
            hostEmail: studio.hostEmail,

            bookingDate,
            startTime,
            endTime,

            totalHours,
            hourlyRate,
            totalPrice,

            status: "Pending",

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await getBookingsCollection().insertOne(newBooking);

        return res.status(201).json({
            success: true,
            message: "Booking request submitted successfully",
            data: {
                ...newBooking,
                _id: result.insertedId,
            },
        });

    } catch (error) {
        console.error("Create Booking Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};



export const getMyBookings = async (req, res) => {
    try {
        const bookings = await getBookingsCollection()
            .find({
                creatorId: req.user.id,
            })
            .sort({
                createdAt: -1,
            })
            .toArray();

        return res.status(200).json({
            success: true,
            message: "Your bookings retrieved successfully",
            total: bookings.length,
            data: bookings,
        });

    } catch (error) {
        console.error("Get My Bookings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve your bookings",
        });
    }
};


export const getHostBookings = async (req, res) => {
    try {
        const bookings = await getBookingsCollection()
            .find({
                hostId: req.user.id,
            })
            .sort({
                createdAt: -1,
            })
            .toArray();

        return res.status(200).json({
            success: true,
            message: "Host bookings retrieved successfully",
            total: bookings.length,
            data: bookings,
        });

    } catch (error) {
        console.error("Get Host Bookings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve host bookings",
        });
    }
};


export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate booking ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        // Validate status
        const allowedStatuses = [
            "Confirmed",
            "Cancelled",
            "Completed",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status",
            });
        }

        const bookings = getBookingsCollection();
        const bookingId = new ObjectId(id);

        // Find booking belonging to this host
        const booking = await bookings.findOne({
            _id: bookingId,
            hostId: req.user.id,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or you are not authorized",
            });
        }

        // Validate status transition
        if (booking.status !== "Pending" && status !== "Cancelled") {
            if (
                booking.status === "Confirmed" &&
                status === "Completed"
            ) {
                // Allowed transition
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Cannot change booking status from ${booking.status} to ${status}`,
                });
            }
        }

        // Completed is only allowed for confirmed bookings
        if (status === "Completed" && booking.status !== "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "Only confirmed bookings can be completed",
            });
        }

        // Check overlapping bookings before confirmation
        if (status === "Confirmed") {
            const overlappingBooking = await bookings.findOne({
                _id: { $ne: bookingId },
                studioId: booking.studioId,
                bookingDate: booking.bookingDate,
                status: "Confirmed",
                startTime: { $lt: booking.endTime },
                endTime: { $gt: booking.startTime },
            });

            if (overlappingBooking) {
                return res.status(409).json({
                    success: false,
                    message: "This time slot is already confirmed for another booking.",
                });
            }
        }

        // Update only if the booking still has its previous status
        const updateResult = await bookings.updateOne(
            {
                _id: bookingId,
                hostId: req.user.id,
                status: booking.status,
            },
            {
                $set: {
                    status,
                    updatedAt: new Date(),
                },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(409).json({
                success: false,
                message: "Booking status has changed. Please refresh and try again.",
            });
        }

        const updatedBooking = await bookings.findOne({
            _id: bookingId,
        });

        return res.status(200).json({
            success: true,
            message: `Booking ${status.toLowerCase()} successfully`,
            data: updatedBooking,
        });

    } catch (error) {
        console.error("Update Booking Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update booking status",
        });
    }
};



export const cancelMyBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate booking ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const bookings = getBookingsCollection();
        const bookingId = new ObjectId(id);

        // Only the creator can cancel their own Pending booking
        const result = await bookings.updateOne(
            {
                _id: bookingId,
                creatorId: req.user.id,
                status: "Pending",
            },
            {
                $set: {
                    status: "Cancelled",
                    updatedAt: new Date(),
                },
            }
        );

        if (result.modifiedCount === 0) {
            const booking = await bookings.findOne({
                _id: bookingId,
                creatorId: req.user.id,
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Only Pending bookings can be cancelled",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};
