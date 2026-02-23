package com.neurofleetx.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Maps expected domain/service exceptions to appropriate HTTP status codes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private ApiError errorPayload(HttpStatus status, String message, HttpServletRequest request) {
        return new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(UserNotFoundException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(errorPayload(status, ex.getMessage(), request));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiError> handleDuplicateEmail(DuplicateEmailException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.CONFLICT;
        return ResponseEntity.status(status).body(errorPayload(status, ex.getMessage(), request));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        // e.g., invalid role value, invalid inputs, etc.
        HttpStatus status = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(errorPayload(status, ex.getMessage(), request));
    }
}
