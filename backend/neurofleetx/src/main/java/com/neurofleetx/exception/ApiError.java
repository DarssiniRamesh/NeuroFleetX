package com.neurofleetx.exception;

import java.time.Instant;

/**
 * Standard API error payload returned by the service for expected errors.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
