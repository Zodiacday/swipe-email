/**
 * Standardized error types for API responses.
 */

export type ErrorType = "network" | "auth" | "rate_limit" | "gmail_api" | "validation" | "unknown";

export interface AppError {
    type: ErrorType;
    message: string;
    retryable: boolean;
    retryAfter?: number; // Seconds to wait before retry
    originalError?: unknown;
}

/**
 * Classify an error into a standardized AppError.
 */
export function classifyError(error: unknown): AppError {
    // Network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
            type: "network",
            message: "Network error. Check your connection.",
            retryable: true,
            originalError: error,
        };
    }

    // Response object with status code
    if (typeof error === "object" && error !== null) {
        const err = error as any;

        // 401 Unauthorized
        if (err.status === 401 || err.code === 401) {
            return {
                type: "auth",
                message: "Session expired. Please sign in again.",
                retryable: false,
                originalError: error,
            };
        }

        // 429 Rate limit
        if (err.status === 429 || err.code === 429) {
            const retryAfter = parseInt(err.headers?.["retry-after"] || "60", 10);
            return {
                type: "rate_limit",
                message: "Too many requests. Please wait a moment.",
                retryable: true,
                retryAfter,
                originalError: error,
            };
        }

        // 400 Bad request
        if (err.status === 400 || err.code === 400) {
            return {
                type: "validation",
                message: err.message || "Invalid request.",
                retryable: false,
                originalError: error,
            };
        }

        // 5xx Server errors
        if (err.status >= 500 && err.status < 600) {
            return {
                type: "gmail_api",
                message: "Gmail is temporarily unavailable. Try again later.",
                retryable: true,
                retryAfter: 30,
                originalError: error,
            };
        }
    }

    // Fallback
    return {
        type: "unknown",
        message: error instanceof Error ? error.message : "Something went wrong.",
        retryable: false,
        originalError: error,
    };
}

/**
 * User-friendly error messages for toast display.
 */
export function getErrorMessage(error: AppError): string {
    switch (error.type) {
        case "network":
            return "🌐 No internet connection";
        case "auth":
            return "🔐 Please sign in again";
        case "rate_limit":
            return `⏳ Wait ${error.retryAfter || 60}s before trying again`;
        case "gmail_api":
            return "📧 Gmail is having issues. Try later.";
        case "validation":
            return `⚠️ ${error.message}`;
        default:
            return `❌ ${error.message}`;
    }
}

/**
 * Determine toast type based on error type.
 */
export function getErrorToastType(error: AppError): "error" | "warning" | "info" {
    if (error.type === "rate_limit") return "warning";
    if (error.retryable) return "warning";
    return "error";
}
