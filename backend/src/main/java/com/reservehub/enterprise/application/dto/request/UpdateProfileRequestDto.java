package com.reservehub.enterprise.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update the user profile including base64 avatar")
public class UpdateProfileRequestDto {

    @NotBlank(message = "Full name cannot be blank")
    @Schema(description = "User's full name", example = "Jane Doe")
    private String fullName;

    @Schema(description = "User's phone number", example = "+1 234 567 890")
    private String phone;

    @Schema(description = "User's job title", example = "Operations Director")
    private String jobTitle;

    @Schema(description = "User's department", example = "Hospitality")
    private String department;

    @Schema(description = "User's biography or notes")
    private String biography;

    @Schema(description = "Base64 encoded avatar image, usually a data URL", example = "data:image/png;base64,iVBORw0KGgo...")
    private String avatarBase64;
}
