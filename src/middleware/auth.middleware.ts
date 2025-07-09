import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError"
import jwt from "jsonwebtoken";
import { User } from "../model/user.model";
import 'dotenv/config';


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
        if (!token) {
           throw new ApiError(401, "Unauthorized request")
        }
        const secret = process.env.ACCESS_TOKEN_SECRET as string;
        const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
        const userId = typeof decodedToken === "object" && "_id" in decodedToken ? decodedToken._id : null;
        if (!userId) {
            throw new ApiError(401, "Invalid AccessToken");
        }
        const user = await User.findById(userId).select("-password");
        if (!user) { 
            throw new ApiError(401, "Invalid AccessToken");
        }
        // @ts-expect-error: Attach user to request object
        req.user = user;
        next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid AccessToken");
    }
});