package com.simple_backend.config;

import com.simple_backend.model.*;
import com.simple_backend.model.enums.*;
import com.simple_backend.repository.*;
import com.simple_backend.security.PasswordEncoderUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        log.info("Checking simple-backend data initialization...");

        Restaurant defaultRestaurant = initDefaultRestaurant();
        initStaffUsers(defaultRestaurant);
        initCategoriesAndDishes(defaultRestaurant);
        initTables(defaultRestaurant);

        log.info("Simple-backend data initialization complete!");
    }

    private Restaurant initDefaultRestaurant() {
        return restaurantRepository.findBySlug("gourmet-bistro")
                .orElseGet(() -> {
                    log.info("Seeding default restaurant: Gourmet Bistro...");
                    Restaurant bistro = Restaurant.builder()
                            .name("Gourmet Bistro")
                            .slug("gourmet-bistro")
                            .description("Fine dining & fresh artisanal dishes with table QR ordering.")
                            .address("100 Culinary Avenue, Foodville")
                            .phone("+1 (555) 234-5678")
                            .logoUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80")
                            .build();
                    return restaurantRepository.save(bistro);
                });
    }

    private void initStaffUsers(Restaurant restaurant) {
        if (userRepository.count() == 0) {
            log.info("Seeding default staff users...");

            User admin = User.builder()
                    .username("admin")
                    .password(PasswordEncoderUtil.hashPassword("admin123"))
                    .fullName("Restaurant Manager")
                    .email("admin@restaurant.com")
                    .role(UserRole.ADMIN)
                    .restaurant(restaurant)
                    .build();

            User kitchen = User.builder()
                    .username("chef")
                    .password(PasswordEncoderUtil.hashPassword("kitchen123"))
                    .fullName("Head Chef")
                    .email("kitchen@restaurant.com")
                    .role(UserRole.KITCHEN)
                    .restaurant(restaurant)
                    .build();

            User waiter = User.builder()
                    .username("waiter")
                    .password(PasswordEncoderUtil.hashPassword("waiter123"))
                    .fullName("Lead Waiter")
                    .email("waiter@restaurant.com")
                    .role(UserRole.WAITER)
                    .restaurant(restaurant)
                    .build();

            userRepository.saveAll(Arrays.asList(admin, kitchen, waiter));
        }
    }

    private void initCategoriesAndDishes(Restaurant restaurant) {
        if (categoryRepository.count() == 0) {
            log.info("Seeding menu categories and dishes...");

            Category appetizers = categoryRepository.save(Category.builder().name("Appetizers").displayOrder(1).isActive(true).restaurant(restaurant).build());
            Category mainCourse = categoryRepository.save(Category.builder().name("Main Course").displayOrder(2).isActive(true).restaurant(restaurant).build());
            Category beverages = categoryRepository.save(Category.builder().name("Beverages").displayOrder(3).isActive(true).restaurant(restaurant).build());
            Category desserts = categoryRepository.save(Category.builder().name("Desserts").displayOrder(4).isActive(true).restaurant(restaurant).build());

            List<Dish> dishes = Arrays.asList(
                    Dish.builder().name("Crispy Spring Rolls").description("Golden fried vegetable rolls").price(new BigDecimal("8.50")).imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80").category(appetizers).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(10).optionsJson("[\"Mild\", \"Extra Dip\"]").build(),
                    Dish.builder().name("Garlic Butter Prawns").description("Sautéed tiger prawns").price(new BigDecimal("14.00")).imageUrl("https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80").category(appetizers).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(12).optionsJson("[\"Spicy\"]").build(),
                    Dish.builder().name("Grilled Salmon Steak").description("Pan-seared Atlantic salmon").price(new BigDecimal("22.00")).imageUrl("https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80").category(mainCourse).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(20).optionsJson("[\"Mashed Potato\"]").build(),
                    Dish.builder().name("Classic Wagyu Burger").description("Premium Wagyu beef patty").price(new BigDecimal("18.50")).imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80").category(mainCourse).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(15).optionsJson("[\"Medium Rare\", \"Well Done\"]").build(),
                    Dish.builder().name("Craft Mango Smoothie").description("Fresh Alphonso mango").price(new BigDecimal("6.00")).imageUrl("https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80").category(beverages).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(5).optionsJson("[\"Less Sugar\"]").build(),
                    Dish.builder().name("Warm Chocolate Lava Cake").description("Molten chocolate cake").price(new BigDecimal("9.00")).imageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80").category(desserts).restaurant(restaurant).isAvailable(true).preparationTimeMinutes(10).optionsJson("[\"Extra Vanilla Scoop\"]").build()
            );

            dishRepository.saveAll(dishes);
        }
    }

    private void initTables(Restaurant restaurant) {
        if (tableRepository.count() == 0) {
            log.info("Seeding 10 restaurant tables with QR tokens...");

            for (int i = 1; i <= 10; i++) {
                int capacity = (i % 3 == 0) ? 6 : (i % 2 == 0 ? 4 : 2);
                RestaurantTable table = RestaurantTable.builder()
                        .tableNumber(i)
                        .capacity(capacity)
                        .status(TableStatus.AVAILABLE)
                        .qrToken("QR-GB-TBL-" + i + "-TOKEN")
                        .restaurant(restaurant)
                        .build();
                tableRepository.save(table);
            }
        }
    }
}
