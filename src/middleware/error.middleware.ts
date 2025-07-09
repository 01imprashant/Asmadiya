// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            data: err.data,
            message: err.message,
            success: err.success,
            errors: err.errors
        });
    }

    // For unhandled errors
    return res.status(500).json({
        statusCode: 500,
        data: null,
        message: err.message || "Internal Server Error",
        success: false,
        errors: []
    });
};

export default errorHandler;