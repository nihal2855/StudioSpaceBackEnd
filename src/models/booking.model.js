
import { getDB } from "../config/db.js";

export const getBookingsCollection = () => {
    return getDB().collection("bookings");
};

export const createBookingIndexes = async () => {
    const bookings = getBookingsCollection();

    await Promise.all([
        // Find bookings by creator
        bookings.createIndex({ creatorId: 1 }),

        // Find bookings by host
        bookings.createIndex({ hostId: 1 }),

        // Find bookings by studio
        bookings.createIndex({ studioId: 1 }),

        // Filter bookings by status
        bookings.createIndex({ status: 1 }),

        // Find bookings by date and time
        bookings.createIndex({
            studioId: 1,
            bookingDate: 1,
            status: 1,
        }),

        // Sort newest bookings first
        bookings.createIndex({ createdAt: -1 }),
    ]);

    console.log("Booking indexes created successfully");
};
