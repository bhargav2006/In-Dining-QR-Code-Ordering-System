package com.qr_restaurant.qr_restaurant_backend.security;

import com.qr_restaurant.qr_restaurant_backend.model.Restaurant;
import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import com.qr_restaurant.qr_restaurant_backend.repository.RestaurantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class SecurityAuthenticationAndRbacTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private RestaurantRepository restaurantRepository;

    private Long testRestaurantId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        Restaurant restaurant = restaurantRepository.findBySlug("gourmet-bistro")
                .orElseGet(() -> restaurantRepository.save(Restaurant.builder()
                        .name("Gourmet Bistro")
                        .slug("gourmet-bistro")
                        .build()));
        testRestaurantId = restaurant.getId();
    }

    // --- 1. Missing Token Tests (401 Unauthorized) ---

    @Test
    @DisplayName("Missing Token: GET /api/manager/categories returns 401 Unauthorized")
    void testMissingToken_ManagerEndpoint_Returns401() throws Exception {
        mockMvc.perform(get("/api/manager/categories"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Missing Token: GET /api/kitchen/orders returns 401 Unauthorized")
    void testMissingToken_KitchenEndpoint_Returns401() throws Exception {
        mockMvc.perform(get("/api/kitchen/orders"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Missing Token: GET /api/waiter/tables returns 401 Unauthorized")
    void testMissingToken_WaiterEndpoint_Returns401() throws Exception {
        mockMvc.perform(get("/api/waiter/tables"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    // --- 2. Malformed Token Tests (401 Unauthorized) ---

    @Test
    @DisplayName("Malformed Token: Invalid bearer token string returns 401 Unauthorized")
    void testMalformedToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/manager/categories")
                        .header("Authorization", "Bearer invalid.malformed.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    // --- 3. Expired Token Tests (401 Unauthorized) ---

    @Test
    @DisplayName("Expired Token: Token with past expiration timestamp returns 401 Unauthorized")
    void testExpiredToken_Returns401() throws Exception {
        String expiredToken = tokenProvider.generateTokenWithCustomExpiration(
                1L, "admin_user", UserRole.ADMIN, testRestaurantId, -10000L);

        mockMvc.perform(get("/api/manager/categories")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    // --- 4. Role-Based Access Control (RBAC) Tests ---

    @Test
    @DisplayName("RBAC: WAITER cannot access manager or kitchen endpoints (403 Forbidden)")
    void testRoleRestrictions_WaiterRole() throws Exception {
        String waiterToken = tokenProvider.generateToken(
                2L, "waiter_user", UserRole.WAITER, testRestaurantId);

        // Waiter accessing Manager portal -> 403 Forbidden
        mockMvc.perform(get("/api/manager/categories")
                        .header("Authorization", "Bearer " + waiterToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));

        // Waiter accessing Kitchen portal -> 403 Forbidden
        mockMvc.perform(get("/api/kitchen/orders")
                        .header("Authorization", "Bearer " + waiterToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // Waiter accessing Waiter portal -> 200 OK
        mockMvc.perform(get("/api/waiter/tables")
                        .header("Authorization", "Bearer " + waiterToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC: KITCHEN cannot access manager or waiter endpoints (403 Forbidden)")
    void testRoleRestrictions_KitchenRole() throws Exception {
        String kitchenToken = tokenProvider.generateToken(
                3L, "kitchen_user", UserRole.KITCHEN, testRestaurantId);

        // Kitchen accessing Manager portal -> 403 Forbidden
        mockMvc.perform(get("/api/manager/categories")
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // Kitchen accessing Waiter portal -> 403 Forbidden
        mockMvc.perform(get("/api/waiter/tables")
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        // Kitchen accessing Kitchen portal -> 200 OK
        mockMvc.perform(get("/api/kitchen/orders")
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC: ADMIN can access manager, kitchen, and waiter portals (200 OK)")
    void testRoleRestrictions_AdminRole() throws Exception {
        String adminToken = tokenProvider.generateToken(
                1L, "admin_user", UserRole.ADMIN, testRestaurantId);

        mockMvc.perform(get("/api/manager/categories")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/kitchen/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/waiter/tables")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    // --- 5. Public and Customer Endpoints Open Access ---

    @Test
    @DisplayName("Public Access: /api/customer/categories and /api/health are publicly accessible without JWT")
    void testPublicEndpoints_AccessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("Accept", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/customer/categories"))
                .andExpect(status().isOk());
    }
}
