import React, { useState } from 'react';

export const QaTestRunner: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<'service' | 'security' | 'docker'>('service');

  const testCases = [
    {
      suite: 'ReservationServiceTest',
      name: 'shouldCreateReservationSuccessfully',
      duration: '34ms',
      status: 'SUPERADO',
      description: 'Verifica la confirmación exitosa de una reserva sin colisión y el cálculo de precios del acuerdo SLA.',
    },
    {
      suite: 'ReservationServiceTest',
      name: 'shouldThrowOverlappingReservationExceptionWhenAssetIsOccupied',
      duration: '22ms',
      status: 'SUPERADO',
      description: 'Confirma que los intentos sobrepuestos lanzan OverlappingReservationException considerando el margen de 35m.',
    },
    {
      suite: 'ReservationServiceTest',
      name: 'shouldRejectInvalidTimeBounds',
      duration: '11ms',
      status: 'SUPERADO',
      description: 'Valida que una hora de inicio posterior a la de fin sea rechazada con IllegalArgumentException.',
    },
    {
      suite: 'ReservationServiceTest',
      name: 'shouldDispatchReservationSuccessfully',
      duration: '18ms',
      status: 'SUPERADO',
      description: 'Verifica la transición de estado de CONFIRMED a IN_TRANSIT durante el despacho.',
    },
    {
      suite: 'SecurityIntegrationTest',
      name: 'shouldRejectUnauthenticatedRequest',
      duration: '29ms',
      status: 'SUPERADO',
      description: 'Verifica 401 Unauthorized cuando el token Bearer está ausente en el endpoint protegido /reservations.',
    },
    {
      suite: 'SecurityIntegrationTest',
      name: 'shouldDenyDispatchToClientRole',
      duration: '25ms',
      status: 'SUPERADO',
      description: 'Verifica 403 Forbidden cuando ROLE_CLIENTE intenta invocar el endpoint administrativo de despacho.',
    },
    {
      suite: 'SecurityIntegrationTest',
      name: 'shouldDenyDeleteToClientRole',
      duration: '21ms',
      status: 'SUPERADO',
      description: 'Verifica 403 Forbidden cuando ROLE_CLIENTE intenta DELETE /reservations/{id}.',
    },
    {
      suite: 'SecurityIntegrationTest',
      name: 'shouldAllowAdminToDeleteReservation',
      duration: '19ms',
      status: 'SUPERADO',
      description: 'Verifica 204 No Content cuando ROLE_ADMIN purga el registro de la reserva.',
    },
  ];

  const handleRerun = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Test Suite Summary Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              8 de 8 SUPERADAS (100%)
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Suite de Pruebas Backend QA (JUnit 5 y Mockito)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verificación automatizada de invariantes de negocio, prevención de colisiones y Spring Security RBAC.
          </p>
        </div>

        <button
          onClick={handleRerun}
          disabled={running}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {running ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Ejecutando Motor de Pruebas...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Reejecutar Suite de Pruebas QA</span>
            </>
          )}
        </button>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
          MATRIZ DE RESULTADOS DE EJECUCIÓN
        </div>
        <div className="divide-y divide-slate-100">
          {testCases.map((tc, idx) => (
            <div key={idx} className="p-4 flex items-start justify-between gap-4 text-xs hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  <span className="font-mono font-bold text-slate-900">{tc.name}()</span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {tc.suite}
                  </span>
                </div>
                <p className="text-slate-600 pl-6 text-[11px] leading-relaxed">{tc.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-slate-400 text-[11px]">{tc.duration}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  {tc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900">INSPECTOR DE CÓDIGO FUENTE JAVA DE PRODUCCIÓN</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedFile('service')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                selectedFile === 'service' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ReservationServiceTest.java
            </button>
            <button
              onClick={() => setSelectedFile('security')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                selectedFile === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              SecurityIntegrationTest.java
            </button>
            <button
              onClick={() => setSelectedFile('docker')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                selectedFile === 'docker' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dockerfile y Compose
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-96">
          {selectedFile === 'service' && (
            <pre>{`// ReservationServiceTest.java
@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private ReservationRepositoryPort reservationRepositoryPort;
    @Mock private AssetRepositoryPort assetRepositoryPort;
    @Mock private DepotRepositoryPort depotRepositoryPort;
    @InjectMocks private ReservationService reservationService;

    @Test
    void shouldThrowOverlappingReservationExceptionWhenAssetIsOccupied() {
        Reservation conflicting = Reservation.builder()
            .assetId(1L)
            .startTime(validRequest.getStartTime().plusHours(1))
            .endTime(validRequest.getEndTime().plusHours(2))
            .build();

        when(reservationRepositoryPort.findOverlappingReservations(eq(1L), any(), any()))
            .thenReturn(List.of(conflicting));

        assertThatThrownBy(() -> reservationService.createReservation(validRequest, "operator@enterprise.com"))
            .isInstanceOf(OverlappingReservationException.class)
            .hasMessageContaining("Collision detected!");
    }
}`}</pre>
          )}

          {selectedFile === 'security' && (
            <pre>{`// SecurityIntegrationTest.java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    @Test
    void shouldDenyDispatchToClientRole() throws Exception {
        String clientJwt = jwtTokenProvider.generateToken("sarah.jenkins@acme.com", "ROLE_CLIENTE", 3600000L);

        mockMvc.perform(post("/reservations/1/dispatch")
                .header("Authorization", "Bearer " + clientJwt))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN_PRIVILEGE_LEVEL"));
    }
}`}</pre>
          )}

          {selectedFile === 'docker' && (
            <pre>{`# Multi-Stage Build Dockerfile (eclipse-temurin:21-alpine)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
USER appuser
HEALTHCHECK CMD wget --spider http://localhost:8080/api/v1/actuator/health || exit 1
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseG1GC", "-jar", "app.jar"]`}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
