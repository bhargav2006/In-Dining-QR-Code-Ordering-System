package com.simple_backend.service;

import com.simple_backend.model.*;
import com.simple_backend.model.enums.TableStatus;
import com.simple_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;

    public Map<String, Object> getDashboardStats(Long restaurantId) {
        long activeOrders;
        BigDecimal revenue;
        long activeTables;

        if (restaurantId != null) {
            activeOrders = orderRepository.countActiveOrdersByRestaurantId(restaurantId);
            revenue = orderRepository.calculateTotalRevenueByRestaurantId(restaurantId);
            activeTables = tableRepository.findByRestaurantIdOrderByTableNumberAsc(restaurantId)
                    .stream().filter(t -> t.getStatus() == TableStatus.OCCUPIED || t.getStatus() == TableStatus.BILL_REQUESTED).count();
        } else {
            activeOrders = orderRepository.countActiveOrders();
            revenue = orderRepository.calculateTotalRevenue();
            activeTables = tableRepository.findByStatus(TableStatus.OCCUPIED).size();
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeOrdersCount", activeOrders);
        stats.put("totalRevenue", revenue);
        stats.put("occupiedTablesCount", activeTables);
        return stats;
    }

    public List<Category> getCategories(Long restaurantId) {
        if (restaurantId != null) return categoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);
        return categoryRepository.findAll();
    }

    public Category saveCategory(Category category, Long restaurantId) {
        if (category.getRestaurant() == null && restaurantId != null) {
            restaurantRepository.findById(restaurantId).ifPresent(category::setRestaurant);
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    public List<Dish> getDishes(Long restaurantId) {
        if (restaurantId != null) return dishRepository.findByRestaurantId(restaurantId);
        return dishRepository.findAll();
    }

    public Dish saveDish(Dish dish, Long restaurantId) {
        if (dish.getRestaurant() == null && restaurantId != null) {
            restaurantRepository.findById(restaurantId).ifPresent(dish::setRestaurant);
        }
        return dishRepository.save(dish);
    }

    public Dish toggleDishAvailability(Long id) {
        Dish dish = dishRepository.findById(id).orElseThrow(() -> new RuntimeException("Dish not found"));
        dish.setIsAvailable(!dish.getIsAvailable());
        return dishRepository.save(dish);
    }

    public void deleteDish(Long id) {
        dishRepository.deleteById(id);
    }

    public List<RestaurantTable> getTables(Long restaurantId) {
        if (restaurantId != null) return tableRepository.findByRestaurantIdOrderByTableNumberAsc(restaurantId);
        return tableRepository.findAll();
    }

    public RestaurantTable saveTable(RestaurantTable table, Long restaurantId) {
        if (table.getRestaurant() == null && restaurantId != null) {
            restaurantRepository.findById(restaurantId).ifPresent(table::setRestaurant);
        }
        if (table.getQrToken() == null || table.getQrToken().isBlank()) {
            String slug = table.getRestaurant() != null ? table.getRestaurant().getSlug().toUpperCase() : "GB";
            table.setQrToken("QR-" + slug + "-TBL-" + table.getTableNumber() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        return tableRepository.save(table);
    }

    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }

    public List<Order> getAllOrders(Long restaurantId) {
        if (restaurantId != null) return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        return orderRepository.findAll();
    }
}
