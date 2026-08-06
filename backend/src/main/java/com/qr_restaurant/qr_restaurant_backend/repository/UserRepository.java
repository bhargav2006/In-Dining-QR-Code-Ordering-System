package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.User;
import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
}
