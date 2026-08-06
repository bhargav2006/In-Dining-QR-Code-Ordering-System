package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.*;
import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.SessionStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private RestaurantTableRepository tableRepository;

    @Mock
    private TableSessionRepository sessionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private DishRepository dishRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AssistanceRequestRepository assistanceRequestRepository;

    @InjectMocks
    private CustomerService customerService;

    private RestaurantTable mockTable;

    @BeforeEach
    void setUp() {
        mockTable = new RestaurantTable();
        mockTable.setId(1L);
        mockTable.setTableNumber(1);
        mockTable.setStatus(TableStatus.AVAILABLE);
        mockTable.setQrToken("QR-TBL-1");
    }

    @Test
    @DisplayName("Unit Test: Start session on available table creates new active session")
    void testStartSession_AvailableTable_Success() {
        when(tableRepository.findByTableNumber(1)).thenReturn(Optional.of(mockTable));

        TableSession mockSession = new TableSession();
        mockSession.setId(10L);
        mockSession.setTable(mockTable);
        mockSession.setSessionToken("SESS-TEST1234");
        mockSession.setStatus(SessionStatus.ACTIVE);

        when(sessionRepository.findByTableIdAndStatus(1L, SessionStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(sessionRepository.save(any(TableSession.class))).thenReturn(mockSession);

        TableScanRequestDto request = new TableScanRequestDto();
        request.setTableNumber(1);

        TableScanResponseDto result = customerService.startOrGetSession(request);

        assertNotNull(result);
        assertEquals("SESS-TEST1234", result.getSessionToken());
        verify(tableRepository, times(1)).save(mockTable);
    }

    @Test
    @DisplayName("Unit Test: Get menu returns available dishes")
    void testGetMenu_ReturnsAvailableDishes() {
        Dish dish = new Dish();
        dish.setId(100L);
        dish.setName("Paneer Butter Masala");
        dish.setPrice(BigDecimal.valueOf(12.99));
        dish.setIsAvailable(true);
        dish.setIsVeg(true);

        when(dishRepository.findByIsAvailableTrue()).thenReturn(Collections.singletonList(dish));

        List<Dish> menu = customerService.getAvailableDishes(null, null);

        assertNotNull(menu);
        assertEquals(1, menu.size());
        assertEquals("Paneer Butter Masala", menu.get(0).getName());
        assertTrue(menu.get(0).getIsVeg());
    }
}
