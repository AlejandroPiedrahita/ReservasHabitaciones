package com.reservehub.enterprise.application.dto.request;

import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload to update an active enterprise reservation")
public class UpdateReservationRequestDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;
    private String destinationOrRoom;
    private String manifestNotes;
    private String assignedConcierge;
}
