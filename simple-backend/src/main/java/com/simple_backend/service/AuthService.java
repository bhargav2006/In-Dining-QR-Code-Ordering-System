package com.simple_backend.service;

import com.simple_backend.model.*;
import com.simple_backend.model.enums.TableStatus;
import com.simple_backend.model.enums.UserRole;
import com.simple_backend.repository.*;
import com.simple_backend.security.PasswordEncoderUtil;
import com.simple_backend.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final RestaurantTableRepository tableRepository;

    public Map<String, Object> login(Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!PasswordEncoderUtil.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = TokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        Restaurant r = user.getRestaurant();

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("token", token);
        response.put("restaurantId", r != null ? r.getId() : null);
        response.put("restaurantName", r != null ? r.getName() : null);
        response.put("restaurantSlug", r != null ? r.getSlug() : null);
        return response;
    }

    @Transactional
    public Map<String, Object> registerRestaurant(Map<String, String> request) {
        String username = request.get("username");
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username '" + username + "' is already taken");
        }

        String restName = request.get("restaurantName");
        String baseSlug = restName.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-").replaceAll("^-|-$", "");
        if (baseSlug.isBlank()) baseSlug = "restaurant";

        String slug = baseSlug;
        int count = 1;
        while (restaurantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }

        Restaurant restaurant = Restaurant.builder()
                .name(restName)
                .slug(slug)
                .description(request.getOrDefault("description", "Welcome to " + restName))
                .address(request.get("address"))
                .phone(request.get("phone"))
                .logoUrl(request.getOrDefault("logoUrl", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"))
                .build();
        restaurant = restaurantRepository.save(restaurant);

        User user = User.builder()
                .username(username)
                .password(PasswordEncoderUtil.hashPassword(request.get("password")))
                .fullName(request.get("fullName"))
                .email(request.get("email"))
                .role(UserRole.ADMIN)
                .restaurant(restaurant)
                .build();
        user = userRepository.save(user);

        seedInitialData(restaurant);

        String token = TokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("token", token);
        response.put("restaurantId", restaurant.getId());
        response.put("restaurantName", restaurant.getName());
        response.put("restaurantSlug", restaurant.getSlug());
        return response;
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    private void seedInitialData(Restaurant restaurant) {
        Category starters = categoryRepository.save(Category.builder().name("Starters & Appetizers").displayOrder(1).isActive(true).restaurant(restaurant).build());
        Category mains = categoryRepository.save(Category.builder().name("Main Courses").displayOrder(2).isActive(true).restaurant(restaurant).build());
        Category drinks = categoryRepository.save(Category.builder().name("Drinks & Beverages").displayOrder(3).isActive(true).restaurant(restaurant).build());

        Dish d1 = Dish.builder().name("Chef Special Starter").description("Fresh appetizer").price(new BigDecimal("9.99")).imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80").category(starters).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(10).optionsJson("[\"Regular\", \"Spicy\"]").build();
        Dish d2 = Dish.builder().name("Signature House Special").description("Top selling dish").price(new BigDecimal("18.99")).imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80").category(mains).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(15).optionsJson("[\"Medium\", \"Well Done\"]").build();
        Dish d3 = Dish.builder().name("Refreshing Lemonade").description("Freshly squeezed").price(new BigDecimal("4.99")).imageUrl("https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80").category(drinks).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(5).optionsJson("[\"Less Sugar\"]").build();

        dishRepository.saveAll(Arrays.asList(d1, d2, d3));

        for (int i = 1; i <= 5; i++) {
            String qrToken = "QR-" + restaurant.getSlug().toUpperCase() + "-TBL-" + i + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            tableRepository.save(RestaurantTable.builder()
                    .tableNumber(i)
                    .capacity((i % 2 == 0) ? 4 : 2)
                    .status(TableStatus.AVAILABLE)
                    .qrToken(qrToken)
                    .restaurant(restaurant)
                    .build());
        }
    }
}
