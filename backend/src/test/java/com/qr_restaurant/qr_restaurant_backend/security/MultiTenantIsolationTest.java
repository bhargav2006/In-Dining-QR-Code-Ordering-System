package com.qr_restaurant.qr_restaurant_backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qr_restaurant.qr_restaurant_backend.dto.DishRequestDto;
import com.qr_restaurant.qr_restaurant_backend.dto.TableRequestDto;
import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.SessionStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class MultiTenantIsolationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TableSessionRepository sessionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Restaurant restaurantAlpha;
    private Restaurant restaurantBeta;

    private Category categoryAlpha;
    private Category categoryBeta;

    private Dish dishAlpha;
    private Dish dishBeta;

    private RestaurantTable tableAlpha;
    private RestaurantTable tableBeta;

    private Order orderAlpha;
    private Order orderBeta;

    private String tokenAdminAlpha;
    private String tokenAdminBeta;
    private String tokenKitchenAlpha;
    private String tokenWaiterAlpha;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Create or find Restaurant Alpha
        restaurantAlpha = restaurantRepository.findBySlug("tenant-alpha")
                .orElseGet(() -> restaurantRepository.save(Restaurant.builder()
                        .name("Tenant Alpha")
                        .slug("tenant-alpha")
                        .build()));

        // Create or find Restaurant Beta
        restaurantBeta = restaurantRepository.findBySlug("tenant-beta")
                .orElseGet(() -> restaurantRepository.save(Restaurant.builder()
                        .name("Tenant Beta")
                        .slug("tenant-beta")
                        .build()));

        // Seed Category & Dish for Alpha
        categoryAlpha = categoryRepository.findByNameAndRestaurantId("Alpha Specials", restaurantAlpha.getId())
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Alpha Specials")
                        .restaurant(restaurantAlpha)
                        .displayOrder(1)
                        .isActive(true)
                        .build()));

        dishAlpha = dishRepository.findByRestaurantId(restaurantAlpha.getId()).stream()
                .filter(d -> d.getName().equals("Alpha Truffle Pasta"))
                .findFirst()
                .orElseGet(() -> dishRepository.save(Dish.builder()
                        .name("Alpha Truffle Pasta")
                        .price(BigDecimal.valueOf(25.00))
                        .category(categoryAlpha)
                        .restaurant(restaurantAlpha)
                        .isAvailable(true)
                        .build()));

        // Seed Category & Dish for Beta
        categoryBeta = categoryRepository.findByNameAndRestaurantId("Beta Burgers", restaurantBeta.getId())
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Beta Burgers")
                        .restaurant(restaurantBeta)
                        .displayOrder(1)
                        .isActive(true)
                        .build()));

        dishBeta = dishRepository.findByRestaurantId(restaurantBeta.getId()).stream()
                .filter(d -> d.getName().equals("Beta Wagyu Burger"))
                .findFirst()
                .orElseGet(() -> dishRepository.save(Dish.builder()
                        .name("Beta Wagyu Burger")
                        .price(BigDecimal.valueOf(30.00))
                        .category(categoryBeta)
                        .restaurant(restaurantBeta)
                        .isAvailable(true)
                        .build()));

        // Seed Tables
        tableAlpha = tableRepository.findByRestaurantIdAndTableNumber(restaurantAlpha.getId(), 101)
                .orElseGet(() -> tableRepository.save(RestaurantTable.builder()
                        .tableNumber(101)
                        .capacity(4)
                        .status(TableStatus.AVAILABLE)
                        .qrToken("QR-ALPHA-101")
                        .restaurant(restaurantAlpha)
                        .build()));

        tableBeta = tableRepository.findByRestaurantIdAndTableNumber(restaurantBeta.getId(), 201)
                .orElseGet(() -> tableRepository.save(RestaurantTable.builder()
                        .tableNumber(201)
                        .capacity(4)
                        .status(TableStatus.AVAILABLE)
                        .qrToken("QR-BETA-201")
                        .restaurant(restaurantBeta)
                        .build()));

        // Seed TableSessions and Orders
        TableSession sessionAlpha = sessionRepository.save(TableSession.builder()
                .table(tableAlpha)
                .tableNumber(101)
                .sessionToken("SESS-ALPHA-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .status(SessionStatus.ACTIVE)
                .startTime(java.time.LocalDateTime.now())
                .restaurant(restaurantAlpha)
                .build());

        TableSession sessionBeta = sessionRepository.save(TableSession.builder()
                .table(tableBeta)
                .tableNumber(201)
                .sessionToken("SESS-BETA-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .status(SessionStatus.ACTIVE)
                .startTime(java.time.LocalDateTime.now())
                .restaurant(restaurantBeta)
                .build());

        orderAlpha = orderRepository.save(Order.builder()
                .orderNumber("ORD-ALPHA-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .tableSession(sessionAlpha)
                .tableNumber(101)
                .status(OrderStatus.PLACED)
                .totalAmount(BigDecimal.valueOf(25.00))
                .taxAmount(BigDecimal.valueOf(2.50))
                .restaurant(restaurantAlpha)
                .build());

        orderBeta = orderRepository.save(Order.builder()
                .orderNumber("ORD-BETA-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .tableSession(sessionBeta)
                .tableNumber(201)
                .status(OrderStatus.PLACED)
                .totalAmount(BigDecimal.valueOf(30.00))
                .taxAmount(BigDecimal.valueOf(3.00))
                .restaurant(restaurantBeta)
                .build());

        // Tokens
        tokenAdminAlpha = tokenProvider.generateToken(10L, "admin_alpha", UserRole.ADMIN, restaurantAlpha.getId());
        tokenAdminBeta = tokenProvider.generateToken(20L, "admin_beta", UserRole.ADMIN, restaurantBeta.getId());
        tokenKitchenAlpha = tokenProvider.generateToken(11L, "kitchen_alpha", UserRole.KITCHEN, restaurantAlpha.getId());
        tokenWaiterAlpha = tokenProvider.generateToken(12L, "waiter_alpha", UserRole.WAITER, restaurantAlpha.getId());
    }

    // --- 1. Manager Tenant Isolation ---

    @Test
    @DisplayName("Tenant Isolation: Manager Alpha only sees dishes belonging to Restaurant Alpha")
    void testManager_ListDishes_TenantIsolated() throws Exception {
        mockMvc.perform(get("/api/manager/dishes")
                        .header("Authorization", "Bearer " + tokenAdminAlpha))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name").value(org.hamcrest.Matchers.hasItem("Alpha Truffle Pasta")))
                .andExpect(jsonPath("$[*].name").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Beta Wagyu Burger"))));
    }

    @Test
    @DisplayName("Tenant Isolation: Manager Alpha passing client ?restaurantId=Beta is ignored")
    void testManager_ListDishes_IgnoresClientRestaurantIdParam() throws Exception {
        mockMvc.perform(get("/api/manager/dishes")
                        .param("restaurantId", String.valueOf(restaurantBeta.getId()))
                        .header("Authorization", "Bearer " + tokenAdminAlpha))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name").value(org.hamcrest.Matchers.hasItem("Alpha Truffle Pasta")))
                .andExpect(jsonPath("$[*].name").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Beta Wagyu Burger"))));
    }

    @Test
    @DisplayName("IDOR Prevention: Manager Alpha cannot modify or delete dishes of Restaurant Beta (400 Bad Request)")
    void testManager_CrossRestaurantDishMutation_Forbidden() throws Exception {
        DishRequestDto updateDto = new DishRequestDto();
        updateDto.setName("Hacked Beta Dish");
        updateDto.setPrice(BigDecimal.valueOf(99.99));
        updateDto.setCategoryId(categoryBeta.getId());

        // Updating Beta's dish as Admin Alpha -> 400 Bad Request
        mockMvc.perform(put("/api/manager/dishes/" + dishBeta.getId())
                        .header("Authorization", "Bearer " + tokenAdminAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("does not belong to your restaurant")));

        // Deleting Beta's dish as Admin Alpha -> 400 Bad Request
        mockMvc.perform(delete("/api/manager/dishes/" + dishBeta.getId())
                        .header("Authorization", "Bearer " + tokenAdminAlpha))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("does not belong to your restaurant")));
    }

    @Test
    @DisplayName("IDOR Prevention: Manager Alpha cannot modify or delete tables of Restaurant Beta (400 Bad Request)")
    void testManager_CrossRestaurantTableMutation_Forbidden() throws Exception {
        TableRequestDto updateDto = new TableRequestDto();
        updateDto.setTableNumber(999);
        updateDto.setCapacity(10);

        mockMvc.perform(put("/api/manager/tables/" + tableBeta.getId())
                        .header("Authorization", "Bearer " + tokenAdminAlpha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("does not belong to your restaurant")));

        mockMvc.perform(delete("/api/manager/tables/" + tableBeta.getId())
                        .header("Authorization", "Bearer " + tokenAdminAlpha))
                .andExpect(status().isBadRequest());
    }

    // --- 2. Kitchen Tenant Isolation ---

    @Test
    @DisplayName("Tenant Isolation: Kitchen Alpha only sees orders from Restaurant Alpha")
    void testKitchen_OrderQueue_TenantIsolated() throws Exception {
        mockMvc.perform(get("/api/kitchen/orders")
                        .header("Authorization", "Bearer " + tokenKitchenAlpha))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].orderNumber").value(org.hamcrest.Matchers.hasItem(orderAlpha.getOrderNumber())))
                .andExpect(jsonPath("$[*].orderNumber").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem(orderBeta.getOrderNumber()))));
    }

    @Test
    @DisplayName("IDOR Prevention: Kitchen Alpha cannot modify order status of Restaurant Beta (400 Bad Request)")
    void testKitchen_CrossRestaurantOrderStatusUpdate_Forbidden() throws Exception {
        mockMvc.perform(patch("/api/kitchen/orders/" + orderBeta.getId() + "/status")
                        .param("status", "PREPARING")
                        .header("Authorization", "Bearer " + tokenKitchenAlpha))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("does not belong to your restaurant")));
    }

    // --- 3. Waiter Tenant Isolation ---

    @Test
    @DisplayName("Tenant Isolation: Waiter Alpha only sees tables belonging to Restaurant Alpha")
    void testWaiter_TableList_TenantIsolated() throws Exception {
        mockMvc.perform(get("/api/waiter/tables")
                        .header("Authorization", "Bearer " + tokenWaiterAlpha))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].tableNumber").value(org.hamcrest.Matchers.hasItem(101)))
                .andExpect(jsonPath("$[*].tableNumber").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem(201))));
    }

    @Test
    @DisplayName("IDOR Prevention: Waiter Alpha cannot alter table status of Restaurant Beta (400 Bad Request)")
    void testWaiter_CrossRestaurantTableStatusUpdate_Forbidden() throws Exception {
        mockMvc.perform(patch("/api/waiter/tables/" + tableBeta.getId() + "/status")
                        .param("status", "OCCUPIED")
                        .header("Authorization", "Bearer " + tokenWaiterAlpha))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("does not belong to your restaurant")));
    }

    @Test
    @DisplayName("IDOR Prevention: Waiter Alpha cannot mark served an order of Restaurant Beta (400 Bad Request)")
    void testWaiter_CrossRestaurantOrderServe_Forbidden() throws Exception {
        mockMvc.perform(patch("/api/waiter/orders/" + orderBeta.getId() + "/serve")
                        .header("Authorization", "Bearer " + tokenWaiterAlpha))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("does not belong to your restaurant")));
    }
}
