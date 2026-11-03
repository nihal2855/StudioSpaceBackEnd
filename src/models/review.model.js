import { getDB } from "../config/db.js";

export const getReviewsCollection = () => {
    return getDB().collection("reviews");
};