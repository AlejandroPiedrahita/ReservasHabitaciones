package com.reservehub.enterprise.application.dto.request;

import com.reservehub.enterprise.domain.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Corporate login request with TOTP MFA support")
public class LoginRequestDto {

    @NotBlank(message = "Corporate email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Corporate email credential", example = "m.armstrong@enterprise-reservehub.net")
    private String email;

    @NotBlank(message = "Account password is required")
    @Schema(description = "Account password", example = "DispatcherKey#2025$Auth")
    private String password;

    @Schema(description = "Desired operational role privilege context", example = "ROLE_ADMIN")
    private Role requestedRole;

    @Schema(description = "6-digit TOTP Enterprise Authenticator code", example = "749312")
    private String totpCode;

    @Schema(description = "Remember terminal token for 30 days flag", example = "true")
    private boolean rememberTerminal;
}
