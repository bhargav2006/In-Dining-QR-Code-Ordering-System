package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.AuthResponseDto;
import com.qr_restaurant.qr_restaurant_backend.dto.LoginRequestDto;
import com.qr_restaurant.qr_restaurant_backend.dto.RegisterRestaurantDto;
import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import com.qr_restaurant.qr_restaurant_backend.security.PasswordEncoderUtil;
import com.qr_restaurant.qr_restaurant_backend.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final RestaurantTableRepository tableRepository;
    private final TokenProvider tokenProvider;

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        boolean isPasswordValid = PasswordEncoderUtil.matches(request.getPassword(), user.getPassword());
        if (!isPasswordValid) {
            throw new BadRequestException("Invalid username or password");
        }

        // Transparently upgrade legacy SHA-256 password hash to BCrypt on successful login
        if (PasswordEncoderUtil.isLegacyHash(user.getPassword())) {
            user.setPassword(PasswordEncoderUtil.hashPassword(request.getPassword()));
            userRepository.save(user);
        }

        Restaurant r = user.getRestaurant();
        Long restaurantId = (r != null) ? r.getId() : null;

        String authToken = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole(), restaurantId);

        return AuthResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(authToken)
                .restaurantId(restaurantId)
                .restaurantName(r != null ? r.getName() : null)
                .restaurantSlug(r != null ? r.getSlug() : null)
                .build();
    }

    @Transactional
    public AuthResponseDto registerRestaurant(RegisterRestaurantDto request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        // Generate clean slug
        String baseSlug = request.getRestaurantName().toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (baseSlug.isBlank()) {
            baseSlug = "restaurant";
        }
        String slug = baseSlug;
        int counter = 1;
        while (restaurantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        // 1. Create Restaurant
        Restaurant restaurant = Restaurant.builder()
                .name(request.getRestaurantName())
                .slug(slug)
                .description(request.getDescription() != null ? request.getDescription() : "Welcome to " + request.getRestaurantName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .logoUrl(request.getLogoUrl() != null && !request.getLogoUrl().isBlank() ? request.getLogoUrl() : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80")
                .build();
        restaurant = restaurantRepository.save(restaurant);

        // 2. Create Owner/Admin User
        User user = User.builder()
                .username(request.getUsername())
                .password(PasswordEncoderUtil.hashPassword(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(UserRole.ADMIN)
                .restaurant(restaurant)
                .build();
        user = userRepository.save(user);

        // 3. Seed starter categories, dishes & tables for this restaurant
        seedInitialRestaurantData(restaurant);

        String authToken = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole(), restaurant.getId());

        return AuthResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(authToken)
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .restaurantSlug(restaurant.getSlug())
                .build();
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    private void seedInitialRestaurantData(Restaurant restaurant) {
        // Starter categories
        Category starters = categoryRepository.save(Category.builder()
                .name("Starters & Appetizers")
                .displayOrder(1)
                .isActive(true)
                .restaurant(restaurant)
                .build());

        Category mains = categoryRepository.save(Category.builder()
                .name("Main Courses")
                .displayOrder(2)
                .isActive(true)
                .restaurant(restaurant)
                .build());

        Category drinks = categoryRepository.save(Category.builder()
                .name("Drinks & Beverages")
                .displayOrder(3)
                .isActive(true)
                .restaurant(restaurant)
                .build());

        // Starter dishes
        Dish d1 = Dish.builder()
                .name("Chef Special Starter")
                .description("Delicious freshly prepared appetizer with house sauce")
                .price(new BigDecimal("9.99"))
                .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80")
                .category(starters)
                .restaurant(restaurant)
                .isAvailable(true)
                .preparationTimeMinutes(10)
                .optionsJson("[\"Regular\", \"Spicy\"]")
                .build();

        Dish d2 = Dish.builder()
                .name("Signature House Special")
                .description("Our top selling main dish prepared with fresh local ingredients")
                .price(new BigDecimal("18.99"))
                .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80")
                .category(mains)
                .restaurant(restaurant)
                .isAvailable(true)
                .preparationTimeMinutes(15)
                .optionsJson("[\"Medium\", \"Well Done\", \"Extra Sauce\"]")
                .build();

        Dish d3 = Dish.builder()
                .name("Refreshing Citrus Lemonade")
                .description("Freshly squeezed lemons with mint and ice")
                .price(new BigDecimal("4.99"))
                .imageUrl("https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80")
                .category(drinks)
                .restaurant(restaurant)
                .isAvailable(true)
                .preparationTimeMinutes(5)
                .optionsJson("[\"Less Sugar\", \"Extra Ice\"]")
                .build();

        dishRepository.saveAll(Arrays.asList(d1, d2, d3));

        // Seed 5 tables with unique QR tokens
        for (int i = 1; i <= 5; i++) {
            int capacity = (i % 2 == 0) ? 4 : 2;
            String qrToken = "QR-" + restaurant.getSlug().toUpperCase() + "-TBL-" + i + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            RestaurantTable table = RestaurantTable.builder()
                    .tableNumber(i)
                    .capacity(capacity)
                    .status(TableStatus.AVAILABLE)
                    .qrToken(qrToken)
                    .restaurant(restaurant)
                    .build();
            tableRepository.save(table);
        }
    }
}
