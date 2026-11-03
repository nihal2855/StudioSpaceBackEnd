
import { createRemoteJWKSet, jwtVerify } from "jose";

const authBaseURL = process.env.BETTER_AUTH_URL?.replace(/\/+$/, "");

if (!authBaseURL) {
    throw new Error("BETTER_AUTH_URL is missing from Server/.env");
}

const JWKS = createRemoteJWKSet(
    new URL(`${authBaseURL}/api/auth/jwks`)
);

export const verifyAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authorization.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is missing",
            });
        }

        const { payload } = await jwtVerify(token, JWKS, {
            issuer: authBaseURL,
            audience: authBaseURL,
            algorithms: ["EdDSA"],
        });

        if (!payload.sub || !payload.email) {
            return res.status(401).json({
                success: false,
                message: "Invalid user token",
            });
        }

        req.user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
        };

        next();
    } catch (error) {
        console.error("JWT verification failed:", {
            name: error.name,
            code: error.code,
            message: error.message,
        });

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
