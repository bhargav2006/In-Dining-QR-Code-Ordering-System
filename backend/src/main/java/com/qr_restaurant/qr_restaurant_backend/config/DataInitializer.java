package com.qr_restaurant.qr_restaurant_backend.config;

import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.*;
import com.qr_restaurant.qr_restaurant_backend.security.PasswordEncoderUtil;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Checking data initialization...");

        cleanupLegacyUniqueConstraints();

        Restaurant defaultRestaurant = initDefaultRestaurant();
        initStaffUsers(defaultRestaurant);
        initCategoriesAndDishes(defaultRestaurant);
        initTables(defaultRestaurant);

        log.info("Data initialization complete!");
    }

    private void cleanupLegacyUniqueConstraints() {
        try {
            log.info("Checking for legacy database unique constraints on restaurant_tables and categories...");

            // Directly drop the specific legacy constraint UK1t9vy8tg8eidmfw4k887ibeu1 if it exists
            try {
                jdbcTemplate.execute("ALTER TABLE restaurant_tables DROP INDEX UK1t9vy8tg8eidmfw4k887ibeu1");
                log.info("Dropped legacy index UK1t9vy8tg8eidmfw4k887ibeu1 from restaurant_tables");
            } catch (Exception ignored) {}

            // Dynamically locate and drop any single-column unique index on restaurant_tables(table_number)
            List<String> tblIndexes = jdbcTemplate.query(
                    "SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurant_tables' " +
                    "AND NON_UNIQUE = 0 AND INDEX_NAME != 'PRIMARY' " +
                    "AND INDEX_NAME NOT IN (SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'restaurant_tables' AND COLUMN_NAME = 'restaurant_id')",
                    (rs, rowNum) -> rs.getString("INDEX_NAME")
            );

            for (String idx : tblIndexes) {
                log.info("Dropping legacy unique index '{}' from restaurant_tables...", idx);
                try {
                    jdbcTemplate.execute("ALTER TABLE restaurant_tables DROP INDEX " + idx);
                } catch (Exception e) {
                    log.warn("Could not drop index {}: {}", idx, e.getMessage());
                }
            }

            // Dynamically locate and drop any single-column unique index on categories(name)
            List<String> catIndexes = jdbcTemplate.query(
                    "SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categories' " +
                    "AND NON_UNIQUE = 0 AND INDEX_NAME != 'PRIMARY' " +
                    "AND INDEX_NAME NOT IN (SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'restaurant_id')",
                    (rs, rowNum) -> rs.getString("INDEX_NAME")
            );

            for (String idx : catIndexes) {
                log.info("Dropping legacy unique index '{}' from categories...", idx);
                try {
                    jdbcTemplate.execute("ALTER TABLE categories DROP INDEX " + idx);
                } catch (Exception e) {
                    log.warn("Could not drop index {}: {}", idx, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Notice during legacy constraint cleanup: {}", e.getMessage());
        }
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

            Category appetizers = categoryRepository.save(Category.builder()
                    .name("Appetizers")
                    .displayOrder(1)
                    .isActive(true)
                    .restaurant(restaurant)
                    .build());

            Category mainCourse = categoryRepository.save(Category.builder()
                    .name("Main Course")
                    .displayOrder(2)
                    .isActive(true)
                    .restaurant(restaurant)
                    .build());

            Category beverages = categoryRepository.save(Category.builder()
                    .name("Beverages")
                    .displayOrder(3)
                    .isActive(true)
                    .restaurant(restaurant)
                    .build());

            Category desserts = categoryRepository.save(Category.builder()
                    .name("Desserts")
                    .displayOrder(4)
                    .isActive(true)
                    .restaurant(restaurant)
                    .build());

            List<Dish> dishes = Arrays.asList(
                    Dish.builder()
                            .name("Crispy Spring Rolls")
                            .description("Golden fried vegetable rolls served with sweet chili dip")
                            .price(new BigDecimal("8.50"))
                            .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80")
                            .category(appetizers)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(10)
                            .optionsJson("[\"Mild\", \"Extra Dip\"]")
                            .build(),

                    Dish.builder()
                            .name("Garlic Butter Prawns")
                            .description("Sautéed tiger prawns in rich garlic herb butter sauce")
                            .price(new BigDecimal("14.00"))
                            .imageUrl("https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80")
                            .category(appetizers)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(12)
                            .optionsJson("[\"Spicy\", \"Garlic Bread Add-on\"]")
                            .build(),

                    Dish.builder()
                            .name("Grilled Salmon Steak")
                            .description("Pan-seared Atlantic salmon with asparagus and lemon butter sauce")
                            .price(new BigDecimal("22.00"))
                            .imageUrl("https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80")
                            .category(mainCourse)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(20)
                            .optionsJson("[\"Mashed Potato\", \"Steamed Veggies\"]")
                            .build(),

                    Dish.builder()
                            .name("Classic Wagyu Burger")
                            .description("Premium Wagyu beef patty, cheddar cheese, caramelized onions & fries")
                            .price(new BigDecimal("18.50"))
                            .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80")
                            .category(mainCourse)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(15)
                            .optionsJson("[\"Medium Rare\", \"Well Done\", \"Extra Cheese\"]")
                            .build(),

                    Dish.builder()
                            .name("Creamy Fettuccine Alfredo")
                            .description("Rich Parmesan cream sauce with grilled chicken breast")
                            .price(new BigDecimal("16.00"))
                            .imageUrl("https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80")
                            .category(mainCourse)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(15)
                            .optionsJson("[\"Extra Mushroom\", \"Gluten Free Pasta\"]")
                            .build(),

                    Dish.builder()
                            .name("Craft Mango Smoothie")
                            .description("Fresh Alphonso mango blended with Greek yogurt & honey")
                            .price(new BigDecimal("6.00"))
                            .imageUrl("https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80")
                            .category(beverages)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(5)
                            .optionsJson("[\"Less Sugar\", \"No Dairy\"]")
                            .build(),

                    Dish.builder()
                            .name("Fresh Iced Lemon Tea")
                            .description("Brewed Earl Grey tea infused with fresh citrus lemon slices")
                            .price(new BigDecimal("4.50"))
                            .imageUrl("https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80")
                            .category(beverages)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(3)
                            .optionsJson("[\"Cold\", \"Hot\", \"Extra Ice\"]")
                            .build(),

                    Dish.builder()
                            .name("Warm Chocolate Lava Cake")
                            .description("Molten chocolate cake served with vanilla bean ice cream")
                            .price(new BigDecimal("9.00"))
                            .imageUrl("https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80")
                            .category(desserts)
                            .restaurant(restaurant)
                            .isAvailable(true)
                            .preparationTimeMinutes(10)
                            .optionsJson("[\"Extra Vanilla Scoop\"]")
                            .build()
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
