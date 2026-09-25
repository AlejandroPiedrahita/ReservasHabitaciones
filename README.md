# 🛡️ Reservas Habitaciones | Aplicación de testeo de reservas y gestión hotelera

[![Spring Boot 3.3](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 21 LTS](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-Limpia%20%2F%20Hexagonal-blue.svg)](#-arquitectura-del-sistema)
[![Seguridad](https://img.shields.io/badge/Seguridad-JWT%20Stateless%20%2B%20RBAC-red.svg)](#-seguridad-y-autenticaci%C3%B3n-stateless)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage%20Alpine-2496ED.svg)](https://www.docker.com/)

Aplicación fullstack diseñada para la gestión de inventario hotelero (suites ejecutivas) y hubs.

---

## 📑 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Motor de Detección de Colisiones](#-motor-de-detección-de-colisiones)
5. [Seguridad y Autenticación Stateless](#-seguridad-y-autenticación-stateless)
6. [Gestión de Perfil y Foto de Avatar](#-gestión-de-perfil-y-foto-de-avatar)
7. [Endpoints de la API REST y Swagger](#-endpoints-de-la-api-rest-y-swagger)
8. [Persistencia y Base de Datos](#-persistencia-y-base-de-datos)
9. [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
10. [Despliegue con Docker](#-despliegue-con-docker)
11. [Credenciales de Prueba y Demostración](#-credenciales-de-prueba-y-demostración)
12. [Batería de Pruebas Automatizadas](#-batería-de-pruebas-automatizadas)

---

## 🌟 Características Principales

- **Arquitectura Limpia / Hexagonal (Puertos y Adaptadores)**: Aislamiento total entre las reglas de negocio (`Domain`), la orquestación de casos de uso (`Application`) y la capa de entrada/salida (`Infrastructure`).
- **Seguridad Zero-Trust Stateless**: Autenticación mediante tokens JWT firmados criptográficamente, contraseñas hasheadas con BCrypt (fuerza 12), protección CORS endurecida y control de acceso basado en roles con `@PreAuthorize` (`ROLE_ADMIN` vs `ROLE_CLIENTE`).
- **Gestión Completa de Perfiles y Avatares**: Actualización de información de usuario y carga de fotos de perfil desde el explorador de archivos local, con persistencia directa en Base de Datos PostgreSQL.
- **Motor Anti-Colisión y Doble Reserva**: Validación automática en el backend que rechaza solapamientos con HTTP `409 Conflict` (`COLLISION_OVERLAP_DETECTED`), incluyendo un buffer obligatorio de **35 minutos para limpieza y desinfección**.
- **Panel Fullstack en Tiempo Real**: Frontend interactivo y reactivo desarrollado en React 19, TypeScript, TailwindCSS v4 y Lucide Icons, con soporte para filtrado de suites, visualización de manifiestos, estados de pago y telemetría de suites.
- **Auditoría de Persistencia Integral**: Almacenamiento relacional completo en PostgreSQL con soporte para transacciones de pago, estados de depósitos, configuraciones globales del sistema (`system_settings`) y alertas IoT (`telemetry_alerts`).

---

## 🏛️ Arquitectura del Sistema

El backend sigue rigurosamente los principios de la Arquitectura Hexagonal:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE INFRAESTRUCTURA                         │
│  ┌───────────────────────┐                  ┌───────────────────────┐  │
│  │   Controladores REST  │                  │   Persistencia JPA    │  │
│  │ (AuthController,      │                  │ (ReservationEntity,   │  │
│  │  ReservationController│                  │  UserEntity,          │  │
│  │  UserController, etc.)│                  │  Adapters JPA)        │  │
│  │   Swagger / OpenAPI   │                  │                       │  │
│  └───────────┬───────────┘                  └───────────▲───────────┘  │
│              │                                          │              │
│  ┌───────────▼───────────┐                  ┌───────────┴───────────┐  │
│  │  Spring Security JWT  │                  │   Redis Cache / Lock  │  │
│  └───────────────────────┘                  └───────────────────────┘  │
│                                                                        │
│        ┌─────────────────────────────────────────────────────┐         │
│        │                  CAPA DE APLICACIÓN                 │         │
│        │  ┌────────────────────────┐  ┌───────────────────┐  │         │
│        │  │ Puertos de Entrada     │  │ Servicios / Casos │  │         │
│        │  │ (ReservationUseCase,   │  │ (ReservationServ, │  │         │
│        │  │  AuthUseCase, User...) │  │  AuthService...)  │  │         │
│        │  └────────────────────────┘  └───────────────────┘  │         │
│        │  ┌────────────────────────┐  ┌───────────────────┐  │         │
│        │  │ DTOs y Validaciones    │  │ Puertos de Salida │  │         │
│        │  │ (Request/Response)     │  │ (RepositoryPorts) │  │         │
│        │  └────────────────────────┘  └───────────────────┘  │         │
│        │                                                     │         │
│        │        ┌───────────────────────────────────┐        │         │
│        │        │          CAPA DE DOMINIO          │        │         │
│        │        │  • Agregados: Reservation         │        │         │
│        │        │  • Entidades: Asset, Depot, User  │        │         │
│        │        │  • Enums: Role, ReservationStatus │        │         │
│        │        │  • Excepciones de Negocio         │        │         │
│        │        │  (Cero dependencias de framework) │        │         │
│        │        └───────────────────────────────────┘        │         │
│        └─────────────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

El repositorio está organizado como una solución fullstack:

```
reservehub-enterprise/
├── src/                                  # Frontend (React 19 + TypeScript + Vite)
│   ├── components/                       # Componentes modulares de interfaz
│   │   ├── AccountSettingsModal.tsx      # Modal de cuenta y carga de avatar
│   │   ├── NavigationBar.tsx             # Barra superior con avatar e identidad
│   │   ├── AssetGrid.tsx                 # Grilla de habitaciones y suites
│   │   ├── PaymentDrawer.tsx             # Pasarela y registro de pagos
│   │   ├── ManifestDrawer.tsx            # Manifiesto y detalles de reserva
│   │   └── ...                           # Componentes operativos adicionales
│   ├── types.ts                          # Tipos e interfaces TypeScript
│   ├── App.tsx                           # Componente raíz y control de vistas
│   └── index.css                         # Estilos globales con TailwindCSS
├── backend/                              # Backend (Spring Boot 3.3.4 + Java 21)
│   ├── pom.xml                           # Dependencias Maven
│   └── src/
│       ├── main/
│       │   ├── java/com/reservehub/enterprise/
│       │   │   ├── domain/               # Modelos, enums y puertos puros
│       │   │   ├── application/          # Casos de uso, DTOs, mappers y servicios
│       │   │   └── infrastructure/       # Controladores REST, JPA, JWT, configs
│       │   └── resources/
│       │       └── application.yml       # Configuración de base de datos y seguridad
│       └── test/                         # Batería de pruebas unitarias y de integración
├── docker-compose.yml                    # Orquestación de contenedores (App + DB + Cache)
├── Dockerfile                            # Empaquetado multi-stage del backend
├── package.json                          # Scripts y dependencias del frontend
└── README.md                             # Documentación oficial del proyecto
```

---

## ⏱️ Motor de Detección de Colisiones

Para evitar la doble reserva de una misma suite o habitación, el motor de reservas valida solapamientos temporales incluyendo el buffer de sanitización de **35 minutos**:

```
Reserva Existente:        [======== VENTANA ASIGNADA ========]
Buffer de Sanitización:   [+35m]                             [+35m]
                          ────────────────────────────────────────────
Intento en conflicto:                 [---- SOLICITUD ----]  -> ❌ 409 CONFLICT
Intento válido:           [-- OK --]                         -> ✅ 201 CREATED
```

**Condición de colisión evaluada en el backend:**
```java
candidateStart < (existingEnd + 35m) && candidateEnd > (existingStart - 35m)
```
Si existe conflicto, el servidor responde con código **409 Conflict** y código `COLLISION_OVERLAP_DETECTED`:
```json
{
  "timestamp": "2026-09-24T20:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Collision detected! Asset [ROOM-ORD-14B] is already allocated from 2026-10-01T08:00 to 2026-10-01T16:00. Includes 35 min sanitation buffer.",
  "path": "/api/v1/reservations",
  "errorCode": "COLLISION_OVERLAP_DETECTED"
}
```

---

## 🔒 Seguridad y Autenticación Stateless

1. **Tokens JWT Criptográficos**: Sesiones validadas mediante cabeceras `Authorization: Bearer <token>`.
2. **Cifrado de Contraseñas**: Implementación de `BCryptPasswordEncoder` con factor de coste 12.
3. **Control de Acceso Basado en Roles (RBAC)**:
   - `ROLE_ADMIN`: Control operativo total (asignación rápida, despacho `IN_TRANSIT`, cancelación/eliminación física de reservas, configuración del sistema).
   - `ROLE_CLIENTE`: Búsqueda de disponibilidad, creación de reservas corporativas y consulta de reservas propias.
4. **Protección de Cabeceras**: Políticas estrictas de CORS, Content-Security-Policy y X-Frame-Options.

---

## 👤 Gestión de Perfil y Foto de Avatar

El sistema permite a cualquier usuario autenticado actualizar su información personal y su avatar mediante carga directa de archivos de imagen:

* **Formatos Soportados**: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`.
* **Codificación y Almacenamiento**: La imagen se procesa y codifica en formato Base64 `Data URL`, almacenándose de forma persistente en la columna `avatar_url` de la tabla `users` en PostgreSQL.
* **Reflejo en Tiempo Real**: Al guardar los cambios, la barra de navegación ([NavigationBar.tsx](file:///c:/Users/TestGr%C3%A1ficos/Downloads/reservehub-enterprise/src/components/NavigationBar.tsx)) y los modales del usuario actualizan automáticamente la fotografía sin requerir recargar la página.

---

## 📡 Endpoints de la API REST y Swagger

El backend expone su documentación interactiva mediante Swagger / OpenAPI 3.0 en:
`http://localhost:8080/api/v1/swagger-ui.html`

> **Nota:** Todos los endpoints tienen como ruta base `/api/v1`.

| Método | Endpoint | Descripción | Rol Requerido |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Inicio de sesión con credenciales y MFA opcional | Público |
| `POST` | `/api/v1/auth/refresh` | Refresco de token de acceso JWT | Público |
| `GET` | `/api/v1/users/me/profile` | Consulta del perfil y avatar del usuario autenticado | Autenticado |
| `PATCH` | `/api/v1/users/me/profile` | Actualización de perfil y guardado de foto de avatar | Autenticado |
| `GET` | `/api/v1/depots` | Lista de depósitos y hubs regionales (ORD-01, ATL-04, etc.) | Público |
| `GET` | `/api/v1/reservations` | Consulta y filtrado de reservas activas | Autenticado |
| `POST` | `/api/v1/reservations` | Creación de nueva reserva con validación anti-colisión | Autenticado |
| `GET` | `/api/v1/reservations/{id}` | Detalle completo de una reserva y estado de pago | Autenticado |
| `PUT` | `/api/v1/reservations/{id}` | Modificación de fechas o datos de la reserva | Autenticado |
| `POST` | `/api/v1/reservations/{id}/dispatch` | Despacho y asignación rápida a estado `IN_TRANSIT` | `ROLE_ADMIN` |
| `POST` | `/api/v1/reservations/{id}/complete` | Marcado de estancia como `COMPLETED` | Autenticado |
| `POST` | `/api/v1/reservations/{id}/cancel` | Cancelación de reserva y liberación de inventario | Autenticado |
| `DELETE` | `/api/v1/reservations/{id}` | Eliminación física permanente de la reserva | `ROLE_ADMIN` |

---

## 💾 Persistencia y Base de Datos

La aplicación cuenta con las siguientes tablas relacionales en PostgreSQL:

1. **`users`**: Identidad, contraseñas hasheadas en BCrypt, roles (`ROLE_ADMIN`, `ROLE_CLIENTE`), teléfono y campo `avatar_url` (tipo `TEXT`) para fotos de perfil en Base64.
2. **`assets`**: Habitaciones y suites hoteleras, categoría (`EXECUTIVE_SUITE`, `CREW_REST_CABIN`, etc.), capacidad, tarifa por noche, piso, amenidades (JSONB) y fecha de sanitización.
3. **`depots`**: Centros y hubs de hospitalidad regionales (dirección, supervisor, contacto y estado operativo).
4. **`reservations`**: Códigos de reserva, fechas de check-in/check-out, huéspedes, estado del ciclo de vida y campos de pago (`payment_status`, `paid_at`, `payment_method`, `payment_last4`, `payment_tx_id`).
5. **`system_settings`**: Parámetros globales de la plataforma (nombre corporativo, modo de mantenimiento, buffer de sanitización, moneda y zona horaria).
6. **`telemetry_alerts`**: Registro persistente de alertas IoT de habitaciones (sensores de temperatura, cerraduras electrónicas y sanitización).

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* **Java 21 LTS** o superior
* **Maven 3.9+**
* **Node.js 18+** y `npm`
* **PostgreSQL 15+** y **Redis 7+** (o mediante Docker)

---

### 1. Iniciar el Backend (Spring Boot)

1. Configurar las variables en `backend/src/main/resources/application.yml` o crear variables de entorno para la base de datos PostgreSQL.
2. Compilar y arrancar la aplicación:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
3. El backend quedará escuchando en:
   * **API**: `http://localhost:8080/api/v1`
   * **Swagger UI**: `http://localhost:8080/api/v1/swagger-ui.html`

---

### 2. Iniciar el Frontend (React + Vite)

1. Instalar las dependencias de Node.js en la raíz del proyecto:
   ```bash
   npm install
   ```
2. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador:
   * `http://localhost:3000` (o `http://localhost:5173`)

---

## 🐳 Despliegue con Docker

Para levantar la solución completa de forma contenerizada (Backend, PostgreSQL y Redis):

1. **Construir y levantar los contenedores:**
   ```bash
   docker compose up --build -d
   ```

2. **Verificar el estado de los servicios:**
   ```bash
   docker compose ps
   ```

3. **Detener y limpiar los contenedores:**
   ```bash
   docker compose down -v
   ```

---

## 🔑 Credenciales de Prueba y Demostración

El sistema se inicializa automáticamente con usuarios de prueba para verificar los diferentes niveles de privilegios:

| Contexto / Rol | Correo Electrónico | Contraseña | Código TOTP MFA | Nivel de Privilegios |
|---|---|---|---|---|
| **ROLE_ADMIN** (Operaciones) | `m.armstrong@enterprise-reservehub.net` | `DispatcherKey#2025$Auth` | `749312` | Despacho de suites, cancelación/purga, configuración global |
| **ROLE_CLIENTE** (Reservas Corporativas) | `sarah.jenkins@acme-enterprises.com` | `ClientPass#2025$Secure` | *N/A* | Creación de reservas, visualización de estancias y pagos |

---

## 🧪 Batería de Pruebas Automatizadas

El backend incluye un conjunto exhaustivo de pruebas unitarias y de integración desarrolladas con **JUnit 5**, **Mockito** y **Spring Security Test**:

```bash
cd backend
mvn clean test
```

### Casos de prueba destacados:
* **`ReservationServiceTest`**:
  * Creación exitosa de reservas sin solapamiento temporal.
  * Disparo de `OverlappingReservationException` ante colisión con reservas existentes o buffer de sanitización.
  * Rechazo de rangos de fechas inválidos (check-in posterior a check-out).
  * Transición de estados de reserva y despacho a `IN_TRANSIT`.
* **`SecurityIntegrationTest`**:
  * Rechazo de solicitudes no autenticadas con HTTP 401 Unauthorized.
  * Denegación de acceso HTTP 403 Forbidden a usuarios con `ROLE_CLIENTE` en endpoints administrativos.
  * Permiso exitoso a usuarios con `ROLE_ADMIN` para operaciones privilegiadas.
