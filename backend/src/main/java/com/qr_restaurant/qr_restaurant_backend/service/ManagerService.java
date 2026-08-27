package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.*;
import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import com.qr_restaurant.qr_restaurant_backend.exception.ResourceNotFoundException;
import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import com.qr_restaurant.qr_restaurant_backend.model.enums.SessionStatus;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final TableSessionRepository sessionRepository;
    private final RestaurantRepository restaurantRepository;
    private final CustomerService customerService;

    private Restaurant getRestaurantOrDefault(Long restaurantId) {
        if (restaurantId != null) {
            return restaurantRepository.findById(restaurantId)
                    .orElseGet(this::getDefaultRestaurant);
        }
        return getDefaultRestaurant();
    }

    private Restaurant getDefaultRestaurant() {
        return restaurantRepository.findBySlug("gourmet-bistro")
                .orElseGet(() -> restaurantRepository.findAll().stream().findFirst().orElse(null));
    }

    // --- Categories ---
    public List<Category> getAllCategories() {
        return getAllCategories(null);
    }

    public List<Category> getAllCategories(Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        if (restaurant != null) {
            return categoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurant.getId());
        }
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Category createCategory(CategoryRequestDto dto) {
        return createCategory(dto, null);
    }

    @Transactional
    public Category createCategory(CategoryRequestDto dto, Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        if (restaurant != null) {
            if (categoryRepository.findByNameAndRestaurantId(dto.getName(), restaurant.getId()).isPresent()) {
                throw new BadRequestException("Category '" + dto.getName() + "' already exists for this restaurant");
            }
        } else if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Category '" + dto.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .restaurant(restaurant)
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryRequestDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category ID " + id + " not found"));
        category.setName(dto.getName());
        if (dto.getDisplayOrder() != null) category.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getIsActive() != null) category.setIsActive(dto.getIsActive());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category ID " + id + " not found"));
        categoryRepository.delete(category);
    }

    // --- Dishes ---
    public List<Dish> getAllDishes() {
        return getAllDishes(null);
    }

    public List<Dish> getAllDishes(Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        if (restaurant != null) {
            return dishRepository.findByRestaurantId(restaurant.getId());
        }
        return dishRepository.findAll();
    }

    public Dish createDish(DishRequestDto dto) {
        return createDish(dto, null);
    }

    @Transactional
    public Dish createDish(DishRequestDto dto, Long restaurantId) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category ID " + dto.getCategoryId() + " not found"));

        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        if (restaurant == null) {
            restaurant = category.getRestaurant();
        }

        Dish dish = Dish.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .restaurant(restaurant)
                .isAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true)
                .preparationTimeMinutes(dto.getPreparationTimeMinutes() != null ? dto.getPreparationTimeMinutes() : 15)
                .optionsJson(dto.getOptionsJson())
                .build();
        return dishRepository.save(dish);
    }

    @Transactional
    public Dish updateDish(Long id, DishRequestDto dto) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish ID " + id + " not found"));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category ID " + dto.getCategoryId() + " not found"));

        dish.setName(dto.getName());
        dish.setDescription(dto.getDescription());
        dish.setPrice(dto.getPrice());
        dish.setImageUrl(dto.getImageUrl());
        dish.setCategory(category);
        if (dto.getIsAvailable() != null) dish.setIsAvailable(dto.getIsAvailable());
        if (dto.getPreparationTimeMinutes() != null) dish.setPreparationTimeMinutes(dto.getPreparationTimeMinutes());
        if (dto.getOptionsJson() != null) dish.setOptionsJson(dto.getOptionsJson());

        return dishRepository.save(dish);
    }

    @Transactional
    public Dish toggleDishAvailability(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish ID " + id + " not found"));
        dish.setIsAvailable(!dish.getIsAvailable());
        return dishRepository.save(dish);
    }

    @Transactional
    public void deleteDish(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish ID " + id + " not found"));
        dishRepository.delete(dish);
    }

    // --- Tables & QR Code ---
    public List<RestaurantTable> getAllTables() {
        return getAllTables(null);
    }

    public List<RestaurantTable> getAllTables(Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        List<RestaurantTable> tables;
        if (restaurant != null) {
            tables = tableRepository.findByRestaurantIdOrderByTableNumberAsc(restaurant.getId());
        } else {
            tables = tableRepository.findAllByOrderByTableNumberAsc();
        }

        for (RestaurantTable table : tables) {
            TableSession activeSession = sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE).orElse(null);
            if (activeSession != null) {
                table.setActiveSessionToken(activeSession.getSessionToken());
            }
        }
        return tables;
    }

    public RestaurantTable createTable(TableRequestDto dto) {
        return createTable(dto, null);
    }

    @Transactional
    public RestaurantTable createTable(TableRequestDto dto, Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        if (restaurant != null) {
            if (tableRepository.findByRestaurantIdAndTableNumber(restaurant.getId(), dto.getTableNumber()).isPresent()) {
                throw new BadRequestException("Table #" + dto.getTableNumber() + " already exists for this restaurant");
            }
        } else if (tableRepository.findByTableNumber(dto.getTableNumber()).isPresent()) {
            throw new BadRequestException("Table #" + dto.getTableNumber() + " already exists");
        }

        String slug = restaurant != null ? restaurant.getSlug().toUpperCase() : "REST";
        String qrToken = "QR-" + slug + "-TBL-" + dto.getTableNumber() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(dto.getTableNumber())
                .capacity(dto.getCapacity())
                .status(TableStatus.AVAILABLE)
                .qrToken(qrToken)
                .restaurant(restaurant)
                .build();
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable regenerateQrToken(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table ID " + tableId + " not found"));
        String slug = table.getRestaurant() != null ? table.getRestaurant().getSlug().toUpperCase() : "REST";
        table.setQrToken("QR-" + slug + "-TBL-" + table.getTableNumber() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable updateTable(Long id, TableRequestDto dto) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table ID " + id + " not found"));

        if (dto.getTableNumber() != null && !dto.getTableNumber().equals(table.getTableNumber())) {
            Long restId = table.getRestaurant() != null ? table.getRestaurant().getId() : null;
            if (restId != null) {
                if (tableRepository.findByRestaurantIdAndTableNumber(restId, dto.getTableNumber()).isPresent()) {
                    throw new BadRequestException("Table #" + dto.getTableNumber() + " already exists for this restaurant");
                }
            } else if (tableRepository.findByTableNumber(dto.getTableNumber()).isPresent()) {
                throw new BadRequestException("Table #" + dto.getTableNumber() + " already exists");
            }
            table.setTableNumber(dto.getTableNumber());
        }

        if (dto.getCapacity() != null) {
            table.setCapacity(dto.getCapacity());
        }

        return tableRepository.save(table);
    }

    @Transactional
    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table ID " + id + " not found"));
        tableRepository.delete(table);
    }

    // --- Sales & Analytics ---
    public SalesSummaryDto getSalesSummary() {
        return getSalesSummary(null);
    }

    public SalesSummaryDto getSalesSummary(Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        Long rId = restaurant != null ? restaurant.getId() : null;

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);

        BigDecimal todaySales = rId != null ? orderRepository.calculateTotalSalesSinceForRestaurant(startOfDay, rId) : orderRepository.calculateTotalSalesSince(startOfDay);
        if (todaySales == null) todaySales = BigDecimal.ZERO;

        Long todayOrders = rId != null ? orderRepository.countOrdersSinceForRestaurant(startOfDay, rId) : orderRepository.countOrdersSince(startOfDay);
        if (todayOrders == null) todayOrders = 0L;

        BigDecimal yesterdaySales = rId != null ? orderRepository.calculateTotalSalesBetweenForRestaurant(startOfYesterday, startOfDay, rId) : orderRepository.calculateTotalSalesBetween(startOfYesterday, startOfDay);
        if (yesterdaySales == null) yesterdaySales = BigDecimal.ZERO;

        Long yesterdayOrders = rId != null ? orderRepository.countOrdersBetweenForRestaurant(startOfYesterday, startOfDay, rId) : orderRepository.countOrdersBetween(startOfYesterday, startOfDay);
        if (yesterdayOrders == null) yesterdayOrders = 0L;

        BigDecimal allTimeSales = rId != null ? orderRepository.calculateAllTimeSalesForRestaurant(rId) : orderRepository.calculateAllTimeSales();
        if (allTimeSales == null) allTimeSales = BigDecimal.ZERO;

        Long allTimeOrders = rId != null ? orderRepository.countAllTimeOrdersForRestaurant(rId) : orderRepository.countAllTimeOrders();
        if (allTimeOrders == null) allTimeOrders = 0L;

        List<RestaurantTable> tables = rId != null ? tableRepository.findByRestaurantIdOrderByTableNumberAsc(rId) : tableRepository.findAll();
        long activeTables = tables.stream().filter(t -> t.getStatus() != TableStatus.AVAILABLE).count();

        List<OrderStatus> pendingStatuses = Arrays.asList(OrderStatus.PLACED, OrderStatus.PREPARING, OrderStatus.READY);
        long pendingOrders = rId != null ?
                orderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtAsc(rId, pendingStatuses).size() :
                orderRepository.findByStatusInOrderByCreatedAtAsc(pendingStatuses).size();

        return SalesSummaryDto.builder()
                .todaySales(todaySales)
                .todayOrdersCount(todayOrders)
                .yesterdaySales(yesterdaySales)
                .yesterdayOrdersCount(yesterdayOrders)
                .allTimeSales(allTimeSales)
                .allTimeOrdersCount(allTimeOrders)
                .activeTablesCount(activeTables)
                .totalTablesCount((long) tables.size())
                .pendingOrdersCount(pendingOrders)
                .build();
    }

    public List<OrderResponseDto> getAllOrders() {
        return getAllOrders(null);
    }

    public List<OrderResponseDto> getAllOrders(Long restaurantId) {
        Restaurant restaurant = getRestaurantOrDefault(restaurantId);
        List<Order> allRawOrders = restaurant != null ?
                orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId()) :
                orderRepository.findAllByOrderByCreatedAtDesc();

        // Group non-cancelled orders by TableSession
        Map<Long, List<Order>> ordersBySession = allRawOrders.stream()
                .filter(o -> o.getTableSession() != null && o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(o -> o.getTableSession().getId(), LinkedHashMap::new, Collectors.toList()));

        List<OrderResponseDto> consolidatedList = new ArrayList<>();

        for (Map.Entry<Long, List<Order>> entry : ordersBySession.entrySet()) {
            List<Order> sessionOrders = entry.getValue();
            if (sessionOrders.isEmpty()) continue;

            Order primaryOrder = sessionOrders.get(0);
            TableSession session = primaryOrder.getTableSession();

            // Consolidate dish items across all sub-orders in session
            Map<String, OrderItemResponseDto> itemMap = new LinkedHashMap<>();
            BigDecimal sessionSubtotal = BigDecimal.ZERO;

            for (Order ord : sessionOrders) {
                OrderResponseDto mappedOrd = customerService.mapToOrderResponseDto(ord);
                if (mappedOrd.getItems() != null) {
                    for (OrderItemResponseDto item : mappedOrd.getItems()) {
                        String key = item.getDishName();
                        if (itemMap.containsKey(key)) {
                            OrderItemResponseDto existing = itemMap.get(key);
                            existing.setQuantity(existing.getQuantity() + item.getQuantity());
                            if (existing.getItemTotal() != null && item.getItemTotal() != null) {
                                existing.setItemTotal(existing.getItemTotal().add(item.getItemTotal()));
                            }
                        } else {
                            OrderItemResponseDto newItem = OrderItemResponseDto.builder()
                                    .id(item.getId())
                                    .dishId(item.getDishId())
                                    .dishName(item.getDishName())
                                    .unitPrice(item.getUnitPrice())
                                    .quantity(item.getQuantity())
                                    .specialInstructions(item.getSpecialInstructions())
                                    .itemTotal(item.getItemTotal())
                                    .build();
                            itemMap.put(key, newItem);
                        }
                    }
                }
                if (ord.getTotalAmount() != null) {
                    sessionSubtotal = sessionSubtotal.add(ord.getTotalAmount());
                }
            }

            // Determine consolidated status
            OrderStatus consolidatedStatus = OrderStatus.COMPLETED;
            if (session.getStatus() == SessionStatus.ACTIVE) {
                boolean anyPreparing = sessionOrders.stream().anyMatch(o -> o.getStatus() == OrderStatus.PREPARING);
                boolean anyPlaced = sessionOrders.stream().anyMatch(o -> o.getStatus() == OrderStatus.PLACED);
                boolean anyReady = sessionOrders.stream().anyMatch(o -> o.getStatus() == OrderStatus.READY);
                boolean anyServed = sessionOrders.stream().anyMatch(o -> o.getStatus() == OrderStatus.SERVED);

                if (anyPreparing) consolidatedStatus = OrderStatus.PREPARING;
                else if (anyPlaced) consolidatedStatus = OrderStatus.PLACED;
                else if (anyReady) consolidatedStatus = OrderStatus.READY;
                else if (anyServed) consolidatedStatus = OrderStatus.SERVED;
            }

            // Consolidate notes
            String combinedNotes = sessionOrders.stream()
                    .map(Order::getNotes)
                    .filter(n -> n != null && !n.isBlank())
                    .collect(Collectors.joining("; "));

            OrderResponseDto consolidatedDto = OrderResponseDto.builder()
                    .orderId(primaryOrder.getId())
                    .orderNumber(primaryOrder.getOrderNumber())
                    .tableNumber(session.getTableNumber())
                    .status(consolidatedStatus)
                    .totalAmount(sessionSubtotal)
                    .notes(combinedNotes.isEmpty() ? null : combinedNotes)
                    .items(new ArrayList<>(itemMap.values()))
                    .createdAt(primaryOrder.getCreatedAt())
                    .build();

            consolidatedList.add(consolidatedDto);
        }

        // Add any standalone CANCELLED or session-less orders
        List<Order> unassignedOrCancelled = allRawOrders.stream()
                .filter(o -> o.getTableSession() == null || (o.getStatus() == OrderStatus.CANCELLED && !ordersBySession.containsKey(o.getTableSession().getId())))
                .collect(Collectors.toList());

        for (Order ord : unassignedOrCancelled) {
            consolidatedList.add(customerService.mapToOrderResponseDto(ord));
        }

        // Sort by timestamp descending
        consolidatedList.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return consolidatedList;
    }
}
