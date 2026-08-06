package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.AuthResponseDto;
import com.qr_restaurant.qr_restaurant_backend.dto.LoginRequestDto;
import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import com.qr_restaurant.qr_restaurant_backend.model.User;
import com.qr_restaurant.qr_restaurant_backend.repository.UserRepository;
import com.qr_restaurant.qr_restaurant_backend.security.PasswordEncoderUtil;
import com.qr_restaurant.qr_restaurant_backend.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        boolean isPasswordValid = PasswordEncoderUtil.matches(request.getPassword(), user.getPassword())
                || user.getPassword().equals(request.getPassword()); // Fallback for backwards compatibility

        if (!isPasswordValid) {
            throw new BadRequestException("Invalid username or password");
        }

        String authToken = TokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

        return AuthResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(authToken)
                .build();
    }
}
