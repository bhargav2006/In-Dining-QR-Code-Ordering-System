package com.qr_restaurant.qr_restaurant_backend;

import com.qr_restaurant.qr_restaurant_backend.dto.TableScanRequestDto;
import com.qr_restaurant.qr_restaurant_backend.dto.TableScanResponseDto;
import com.qr_restaurant.qr_restaurant_backend.model.RestaurantTable;
import com.qr_restaurant.qr_restaurant_backend.model.TableSession;
import com.qr_restaurant.qr_restaurant_backend.model.enums.SessionStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.repository.RestaurantTableRepository;
import com.qr_restaurant.qr_restaurant_backend.repository.TableSessionRepository;
import com.qr_restaurant.qr_restaurant_backend.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @InjectMocks
    private CustomerService customerService;

    private RestaurantTable mockTable;

    @BeforeEach
    void setUp() {
        mockTable = RestaurantTable.builder()
                .id(1L)
                .tableNumber(5)
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .qrToken("QR-TBL-5-TOKEN")
                .build();
    }

    @Test
    void testStartOrGetSession_WithValidQrToken() {
        TableScanRequestDto request = new TableScanRequestDto();
        request.setQrToken("QR-TBL-5-TOKEN");

        when(tableRepository.findByQrToken("QR-TBL-5-TOKEN")).thenReturn(Optional.of(mockTable));
        when(sessionRepository.findByTableIdAndStatus(1L, SessionStatus.ACTIVE)).thenReturn(Optional.empty());
        when(sessionRepository.save(any(TableSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TableScanResponseDto response = customerService.startOrGetSession(request);

        assertNotNull(response);
        assertEquals(5, response.getTableNumber());
        assertNotNull(response.getSessionToken());
        assertTrue(response.getSessionToken().startsWith("SESS-"));
        verify(tableRepository, times(1)).save(mockTable);
    }
}
