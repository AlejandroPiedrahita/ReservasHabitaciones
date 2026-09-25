package com.reservehub.enterprise.infrastructure.web.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "ReserveHub Enterprise API",
                version = "v4.2.0-prod",
                description = "Mission-critical reservation & dispatch logistics backend engineered under Clean Architecture and Spring Boot 3.3. Supports hospitality inventory locks and SLA reservation management under zero-trust verification.",
                contact = @Contact(
                        name = "ReserveHub Enterprise Hospitality Ops",
                        email = "m.armstrong@enterprise-reservehub.net",
                        url = "https://enterprise-reservehub.net"
                ),
                license = @License(
                        name = "Proprietary Enterprise SLA License",
                        url = "https://enterprise-reservehub.net/sla-terms"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080/api/v1", description = "Local Development Gateway"),
                @Server(url = "https://gateway.enterprise-reservehub.net/api/v1", description = "Production Tier-4 Cluster")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        description = "Stateless JWT Token obtained via POST /api/v1/auth/login. Include as: Bearer <token>"
)
public class OpenApiConfig {
}
