package com.neurofleetx.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.neurofleetx.dto.LoginRequest;
import com.neurofleetx.dto.LoginResponse;
import com.neurofleetx.dto.RegisterRequest;
import com.neurofleetx.entity.Role;
import com.neurofleetx.entity.User;
import com.neurofleetx.exception.DuplicateEmailException;
import com.neurofleetx.exception.UserNotFoundException;
import com.neurofleetx.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User register(RegisterRequest req) {
        // Expected failure: duplicate email should not become a 500.
        if (req.getEmail() != null && userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(req.getPassword()) // No security as required
                .role(Role.valueOf(req.getRole()))
                .build();

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest req) {
        // Expected failure: missing user should return 404 (not 500).
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Invalid password returns null so controller responds 401.
        if (!user.getPassword().equals(req.getPassword())) {
            return null;
        }

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());
    }
}
