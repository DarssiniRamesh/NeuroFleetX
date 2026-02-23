package com.neurofleetx.exception;

/**
 * Thrown when attempting to register with an email that already exists.
 */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
