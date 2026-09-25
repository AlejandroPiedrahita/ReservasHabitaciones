package com.reservehub.enterprise.infrastructure.security;

import com.reservehub.enterprise.application.port.in.ReservationUseCase;
import com.reservehub.enterprise.infrastructure.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Enterprise QA Security Integration Tests validating stateless zero-trust
 * access control, 401 Unauthorized, 403 Forbidden, and @PreAuthorize RBAC.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Security & RBAC Integration Test Suite")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private ReservationUseCase reservationUseCase;

    @Test
    @DisplayName("Should return 401 Unauthorized when requesting reservations without Bearer token")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/reservations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Should return 403 Forbidden when ROLE_CLIENTE attempts to dispatch asset (Requires ROLE_ADMIN)")
    void shouldDenyDispatchToClientRole() throws Exception {
        // Generate valid JWT for ROLE_CLIENTE
        String clientJwt = jwtTokenProvider.generateToken("sarah.jenkins@acme-enterprises.com", "ROLE_CLIENTE", 3600000L);

        mockMvc.perform(post("/reservations/1/dispatch")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("Should return 403 Forbidden when ROLE_CLIENTE attempts administrative delete purge")
    void shouldDenyDeleteToClientRole() throws Exception {
        String clientJwt = jwtTokenProvider.generateToken("sarah.jenkins@acme-enterprises.com", "ROLE_CLIENTE", 3600000L);

        mockMvc.perform(delete("/reservations/1")
                        .header("Authorization", "Bearer " + clientJwt)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Should permit ROLE_ADMIN to execute administrative delete purge")
    void shouldAllowAdminToDeleteReservation() throws Exception {
        String adminJwt = jwtTokenProvider.generateToken("m.armstrong@enterprise-reservehub.net", "ROLE_ADMIN", 3600000L);
        doNothing().when(reservationUseCase).deleteReservation(1L);

        mockMvc.perform(delete("/reservations/1")
                        .header("Authorization", "Bearer " + adminJwt)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should allow public access to regional depots catalog without authentication")
    void shouldAllowPublicAccessToDepots() throws Exception {
        mockMvc.perform(get("/depots")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
