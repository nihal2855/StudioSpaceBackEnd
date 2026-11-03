
import { getDB } from "../config/db.js";

export const getStudiosCollection = () => {
    return getDB().collection("studios");
};

export const createStudioIndexes = async () => {
    const studios = getStudiosCollection();

    await Promise.all([
        studios.createIndex({ hostEmail: 1 }),
        studios.createIndex({ category: 1 }),
        studios.createIndex({ createdAt: -1 }),
        studios.createIndex({
            title: "text",
            location: "text",
            overview: "text",
        }),
    ]);

    console.log("Studio indexes created successfully");
};
