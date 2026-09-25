import React, { useState } from 'react';
import { Role, UserSession } from '../types';

interface SwaggerExplorerProps {
  session: UserSession;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  requiredRole?: Role;
  sampleBody?: string;
  responses: { [status: string]: { description: string; body: string } };
}

// Formateador robusto de JSON con sangría estándar de 2 espacios
const formatJsonString = (raw: string): string => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
};

// Componente Visor de JSON con resaltado de sintaxis, numeración de líneas y botón de copiado
const JsonCodeBlock: React.FC<{
  json: string;
  title?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'rose';
}> = ({ json, title, badge = 'application/json', badgeColor = 'emerald' }) => {
  const [copied, setCopied] = useState(false);
  const formattedJson = formatJsonString(json);
  const lines = formattedJson.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Resaltado de sintaxis para cada línea del JSON
  const renderHighlightedLine = (line: string, lineIndex: number) => {
    const coloredParts: React.ReactNode[] = [];
    const tokenRegex =
      /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],:])/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        coloredParts.push(line.substring(lastIndex, match.index));
      }

      const [fullMatch, str, isKeyColon, num, bool, punct] = match;

      if (str) {
        if (isKeyColon) {
          // Llave de propiedad JSON
          coloredParts.push(
            <span key={`${lineIndex}-${match.index}-key`} className="text-sky-300 font-semibold">
              {str}
            </span>
          );
          coloredParts.push(
            <span key={`${lineIndex}-${match.index}-colon`} className="text-slate-400">
              {isKeyColon}
            </span>
          );
        } else {
          // Valor String
          coloredParts.push(
            <span key={`${lineIndex}-${match.index}-str`} className="text-emerald-300">
              {str}
            </span>
          );
        }
      } else if (num) {
        // Valor numérico
        coloredParts.push(
          <span key={`${lineIndex}-${match.index}-num`} className="text-amber-300 font-medium">
            {num}
          </span>
        );
      } else if (bool) {
        // Booleanos o null
        coloredParts.push(
          <span key={`${lineIndex}-${match.index}-bool`} className="text-purple-400 font-bold">
            {bool}
          </span>
        );
      } else if (punct) {
        // Llaves, corchetes, comas
        coloredParts.push(
          <span key={`${lineIndex}-${match.index}-punct`} className="text-slate-400">
            {punct}
          </span>
        );
      }

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < line.length) {
      coloredParts.push(line.substring(lastIndex));
    }

    return (
      <div key={lineIndex} className="table-row hover:bg-slate-800/40 transition-colors">
        <span className="table-cell select-none pr-3 text-right text-slate-500 text-[11px] font-mono border-r border-slate-800/80 w-8 sm:w-10">
          {lineIndex + 1}
        </span>
        <span className="table-cell pl-3 whitespace-pre text-[11px] sm:text-xs font-mono">
          {coloredParts.length > 0 ? coloredParts : line || ' '}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
      {/* Barra de cabecera del editor JSON */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {title && <span className="font-semibold text-slate-200 text-xs">{title}</span>}
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
              badgeColor === 'emerald'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : badgeColor === 'blue'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : badgeColor === 'amber'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}
          >
            {badge}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            {lines.length} líneas • {new TextEncoder().encode(formattedJson).length} bytes
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            title="Descargar archivo JSON"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span className="hidden sm:inline">Descargar</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? '¡Copiado!' : 'Copiar JSON'}</span>
          </button>
        </div>
      </div>

      {/* Contenido con numeración de líneas y sangría perfecta */}
      <div className="p-3 overflow-x-auto max-h-[420px] overflow-y-auto">
        <div className="table w-full">{lines.map((line, idx) => renderHighlightedLine(line, idx))}</div>
      </div>
    </div>
  );
};

export const SwaggerExplorer: React.FC<SwaggerExplorerProps> = ({ session }) => {
  const [activeEndpointId, setActiveEndpointId] = useState<string>('auth-login');
  const [selectedResponseCode, setSelectedResponseCode] = useState<string>('200');
  const [testOutput, setTestOutput] = useState<{
    status: number;
    statusText: string;
    curl: string;
    body: string;
    durationMs: number;
    headers: { [key: string]: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints: EndpointDef[] = [
    {
      id: 'auth-login',
      category: '1. Seguridad y Autenticación',
      method: 'POST',
      path: '/api/v1/auth/login',
      summary: 'Autenticar Operador Corporativo y Emitir JWT',
      description:
        'Verifica las credenciales mediante hash BCrypt y token TOTP de 6 dígitos. Retorna una sesión stateless con JWT firmado y claims de privilegios RBAC.',
      requiresAuth: false,
      sampleBody: formatJsonString(
        JSON.stringify({
          email: 'admin@admin.co',
          password: 'Admin#2026$Pass',
          totpCode: '749312',
        })
      ),
      responses: {
        '200': {
          description: '200 OK — Autenticación exitosa y emisión de token JWT.',
          body: formatJsonString(
            JSON.stringify({
              accessToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jbyIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwidXNlcklkIjoxLCJpYXQiOjE3ODQ3MjAwMDB9.Z8W3t3-ReserveHubShieldSignature',
              tokenType: 'Bearer',
              expiresIn: 3600,
              issuedAt: '2026-09-21T12:30:00.000Z',
              user: {
                id: 1,
                name: 'admin',
                email: 'admin@admin.co',
                role: 'ROLE_ADMIN',
                terminalId: 'RBH-NODE-ORD01',
              },
            })
          ),
        },
        '401': {
          description: '401 Unauthorized — Credenciales incorrectas o código TOTP no validado.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 401,
              error: 'Unauthorized',
              message: 'Credenciales corporativas inválidas o código MFA TOTP incorrecto.',
              path: '/api/v1/auth/login',
              errorCode: 'INVALID_CREDENTIALS_OR_MFA',
            })
          ),
        },
      },
    },
    {
      id: 'depots-list',
      category: '2. Centros de Hospitalidad e Infraestructura',
      method: 'GET',
      path: '/api/v1/depots',
      summary: 'Listar Centros Regionales de Hospitalidad',
      description:
        'Recupera la utilización en tiempo real y el inventario de suites ejecutivas y habitaciones de descanso.',
      requiresAuth: false,
      responses: {
        '200': {
          description: '200 OK — Lista de centros regionales y métricas de ocupación.',
          body: formatJsonString(
            JSON.stringify([
              {
                id: 1,
                code: 'ORD-01',
                name: 'Chicago Central Hospitality Hub',
                location: 'Chicago, IL (Corredor O\'Hare)',
                activeUtilizationRate: 0.0,
                capacities: {
                  suitesActive: 0,
                  suitesTotal: 45,
                },
                telemetryStatus: 'OPTIMAL_HEALTH',
              },
              {
                id: 2,
                code: 'ATL-04',
                name: 'Atlanta Southeastern Rest & Suites Hub',
                location: 'Atlanta, GA (Depósito I-85)',
                activeUtilizationRate: 0.0,
                capacities: {
                  suitesActive: 0,
                  suitesTotal: 32,
                },
                telemetryStatus: 'OPTIMAL_HEALTH',
              },
              {
                id: 3,
                code: 'DFW-02',
                name: 'Dallas Metro Gateway & Suites',
                location: 'Dallas-Fort Worth, TX',
                activeUtilizationRate: 0.0,
                capacities: {
                  suitesActive: 0,
                  suitesTotal: 15,
                },
                telemetryStatus: 'OPTIMAL_HEALTH',
              },
            ])
          ),
        },
      },
    },
    {
      id: 'res-list',
      category: '3. Reservas y Logística de Despacho',
      method: 'GET',
      path: '/api/v1/reservations',
      summary: 'Listar Todas las Reservas y Manifiestos de Despacho',
      description:
        'Recupera las reservas de suites y habitaciones registradas en el sistema. Requiere token de autorización Bearer JWT.',
      requiresAuth: true,
      responses: {
        '200': {
          description: '200 OK — Reservas de suites y manifiestos registrados.',
          body: formatJsonString(
            JSON.stringify([
              {
                id: 1,
                reservationCode: 'RES-2026-9811',
                assetName: 'Suite Ejecutiva Highland 14B',
                assetIdentifier: 'ROOM-ORD-14B',
                customerName: 'Apex Enterprises Global',
                customerEmail: 'reservas@apexenterprises.com',
                startTime: '2026-09-24T08:00:00Z',
                endTime: '2026-09-24T18:00:00Z',
                destinationOrRoom: 'Suite 14B (Piso 3, ORD-01)',
                assignedConcierge: 'Conserjería Central (Turno Mañana)',
                totalAmount: 2013.62,
                status: 'CONFIRMED',
                sanitizationBufferMinutes: 35,
                createdAt: '2026-09-21T10:15:00Z',
              },
            ])
          ),
        },
        '401': {
          description: '401 Unauthorized — Token JWT ausente, expirado o con firma no válida.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 401,
              error: 'Unauthorized',
              message: 'Token de acceso JWT no proporcionado o expirado.',
              path: '/api/v1/reservations',
              errorCode: 'JWT_TOKEN_EXPIRED_OR_INVALID',
            })
          ),
        },
      },
    },
    {
      id: 'res-create',
      category: '3. Reservas y Logística de Despacho',
      method: 'POST',
      path: '/api/v1/reservations',
      summary: 'Asignar Reserva de Activo (Validación de Colisión Sobrepuesta)',
      description:
        'Valida la disponibilidad horaria aplicando el algoritmo matemático de colisión con margen de higienización de 35 minutos antes de persistir.',
      requiresAuth: true,
      sampleBody: formatJsonString(
        JSON.stringify({
          assetId: 1,
          depotId: 1,
          customerName: 'Apex Enterprises Global',
          customerEmail: 'reservas@apexenterprises.com',
          startTime: '2026-09-24T08:00:00Z',
          endTime: '2026-09-24T18:00:00Z',
          destinationOrRoom: 'Suite 14B (Piso 3)',
          manifestNotes: 'Reserva de suite ejecutiva para delegación corporativa.',
          assignedConcierge: 'Conserjería Central',
        })
      ),
      responses: {
        '201': {
          description: '201 Created — Reserva creada exitosamente sin colisiones horarias.',
          body: formatJsonString(
            JSON.stringify({
              id: 4,
              reservationCode: 'RES-2026-8812',
              assetName: 'Suite Ejecutiva Highland 14B',
              assetIdentifier: 'ROOM-ORD-14B',
              customerName: 'Apex Enterprises Global',
              startTime: '2026-09-24T08:00:00Z',
              endTime: '2026-09-24T18:00:00Z',
              destinationOrRoom: 'Suite 14B (Piso 3)',
              assignedConcierge: 'Conserjería Central',
              totalAmount: 1928.62,
              status: 'CONFIRMED',
              sanitizationBufferMinutes: 35,
              collisionCheckPassed: true,
              createdAt: '2026-09-21T12:30:00.000Z',
            })
          ),
        },
        '400': {
          description: '400 Bad Request — Error de validación en los campos o ventana horaria.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 400,
              error: 'Bad Request',
              message: 'La hora de inicio seleccionada debe preceder a la hora de finalización.',
              path: '/api/v1/reservations',
              errorCode: 'INVALID_TIME_WINDOW',
            })
          ),
        },
        '409': {
          description: '409 Conflict — Solapamiento de reserva detectado con margen de 35m.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 409,
              error: 'Conflict',
              message:
                '¡Conflicto de Colisión Horaria! El activo seleccionado ya se encuentra comprometido en la ventana horaria (margen de higienización de 35 minutos incluido).',
              path: '/api/v1/reservations',
              errorCode: 'COLLISION_OVERLAP_DETECTED',
              conflictingReservation: {
                reservationCode: 'RES-2026-9811',
                startTime: '2026-09-24T08:00:00Z',
                endTime: '2026-09-24T18:00:00Z',
                assetIdentifier: 'ROOM-ORD-14B',
              },
            })
          ),
        },
      },
    },
    {
      id: 'res-dispatch',
      category: '3. Reservas y Logística de Despacho',
      method: 'POST',
      path: '/api/v1/reservations/1/dispatch',
      summary: 'Despacho Rápido de Suite [SOLO ROLE_ADMIN]',
      description:
        'Transiciona el estado de reserva de CONFIRMED a IN_TRANSIT. Protegido con @PreAuthorize("hasRole(\'ADMIN\')").',
      requiresAuth: true,
      requiredRole: 'ROLE_ADMIN',
      responses: {
        '200': {
          description: '200 OK — Suite asignada y estado de ocupación activado.',
          body: formatJsonString(
            JSON.stringify({
              id: 1,
              reservationCode: 'RES-2026-9811',
              assetIdentifier: 'ROOM-ORD-14B',
              status: 'IN_TRANSIT',
              dispatchedBy: 'admin (ROLE_ADMIN)',
              dispatchedAt: '2026-09-21T12:30:00.000Z',
              iotLockStatus: 'ACTIVE_LOCK_SYNC',
              message: 'Suite asignada exitosamente al huésped corporativo.',
            })
          ),
        },
        '403': {
          description: '403 Forbidden — Denegado: Requiere nivel de autoridad ROLE_ADMIN.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 403,
              error: 'Forbidden',
              message:
                'Acceso Denegado: La operación de despacho rápido requiere nivel de privilegio "ROLE_ADMIN".',
              path: '/api/v1/reservations/1/dispatch',
              errorCode: 'FORBIDDEN_PRIVILEGE_LEVEL',
            })
          ),
        },
      },
    },
    {
      id: 'res-delete',
      category: '3. Reservas y Logística de Despacho',
      method: 'DELETE',
      path: '/api/v1/reservations/1',
      summary: 'Purga Administrativa de Reserva [SOLO ROLE_ADMIN]',
      description:
        'Elimina permanentemente el manifiesto de la base de datos relacional. Protegido por Spring Security @PreAuthorize("hasRole(\'ADMIN\')").',
      requiresAuth: true,
      requiredRole: 'ROLE_ADMIN',
      responses: {
        '200': {
          description: '200 OK — Confirmación estructurada de purga administrativa.',
          body: formatJsonString(
            JSON.stringify({
              status: 200,
              success: true,
              message: 'Registro de reserva purgado permanentemente de la base de datos relacional.',
              deletedId: 1,
              timestamp: '2026-09-21T12:30:00.000Z',
            })
          ),
        },
        '403': {
          description: '403 Forbidden — Denegado: Requiere nivel de autoridad ROLE_ADMIN.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 403,
              error: 'Forbidden',
              message:
                'Acceso Denegado: La purga permanente de manifiestos requiere autoridad "ROLE_ADMIN".',
              path: '/api/v1/reservations/1',
              errorCode: 'FORBIDDEN_PRIVILEGE_LEVEL',
            })
          ),
        },
      },
    },
    // CRUD 1: HABITACIONES (SOLO ROLE_ADMIN)
    {
      id: 'admin-rooms-list',
      category: '4. CRUD Habitaciones y Suites [ROLE_ADMIN]',
      method: 'GET',
      path: '/api/v1/admin/rooms',
      summary: 'Listar Catálogo Maestro de Habitaciones y Suites',
      description:
        'Retorna el inventario completo de suites hoteleras, estado de cerraduras IoT y protocolos de higienización de 35 minutos. Exclusivo para administradores.',
      requiresAuth: true,
      requiredRole: 'ROLE_ADMIN',
      responses: {
        '200': {
          description: '200 OK — Lista de habitaciones registradas.',
          body: formatJsonString(
            JSON.stringify({
              totalElements: 2,
              content: [
                {
                  id: 1,
                  roomNumber: 'ROOM-ORD-14B',
                  name: 'Suite Ejecutiva Highland 14B',
                  category: 'EXECUTIVE_SUITE',
                  depotCode: 'ORD-01',
                  capacityPersons: 2,
                  baseHourlyRate: 85.0,
                  pricePerNight: 350.0,
                  status: 'AVAILABLE',
                  iotLockId: 'LOCK-IOT-9921',
                  cleanlinessScore: 98,
                },
                {
                  id: 2,
                  roomNumber: 'ROOM-ORD-08A',
                  name: 'Cabina Descanso Tripulación Alpha 08A',
                  category: 'CREW_REST_CABIN',
                  depotCode: 'ORD-01',
                  capacityPersons: 1,
                  baseHourlyRate: 45.0,
                  pricePerNight: 160.0,
                  status: 'OCCUPIED',
                  iotLockId: 'LOCK-IOT-8812',
                  cleanlinessScore: 95,
                },
              ],
            })
          ),
        },
        '403': {
          description: '403 Forbidden — Denegado: Requiere autoridad ROLE_ADMIN.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 403,
              error: 'Forbidden',
              message: 'Acceso Denegado: La gestión de habitaciones requiere autoridad ROLE_ADMIN.',
              path: '/api/v1/admin/rooms',
              errorCode: 'FORBIDDEN_PRIVILEGE_LEVEL',
            })
          ),
        },
      },
    },
    {
      id: 'admin-rooms-create',
      category: '4. CRUD Habitaciones y Suites [ROLE_ADMIN]',
      method: 'POST',
      path: '/api/v1/admin/rooms',
      summary: 'Dar de Alta Nueva Habitación / Suite',
      description:
        'Crea una nueva habitación en el inventario maestro con asignación de terminal, cerradura IoT y validación de tarifas.',
      requiresAuth: true,
      requiredRole: 'ROLE_ADMIN',
      sampleBody: formatJsonString(
        JSON.stringify({
          roomNumber: 'ROOM-ORD-15C',
          name: 'Suite Ejecutiva Highland 15C',
          category: 'EXECUTIVE_SUITE',
          depotId: 1,
          capacityPersons: 2,
          baseHourlyRate: 90.0,
          pricePerNight: 340.0,
          status: 'AVAILABLE',
          iotLockId: 'LOCK-IOT-9922',
          floor: 3,
          amenities: ['Cerradura Inteligente IoT', 'Climatización Smart', 'Wi-Fi 6E Satelital'],
          notes: 'Suite de alta gama para tripulación ejecutiva.',
        })
      ),
      responses: {
        '201': {
          description: '201 Created — Habitación dada de alta exitosamente.',
          body: formatJsonString(
            JSON.stringify({
              id: 7,
              roomNumber: 'ROOM-ORD-15C',
              name: 'Suite Ejecutiva Highland 15C',
              category: 'EXECUTIVE_SUITE',
              depotCode: 'ORD-01',
              status: 'AVAILABLE',
              iotLockId: 'LOCK-IOT-9922',
              createdAt: '2026-09-21T12:35:00.000Z',
            })
          ),
        },
        '400': {
          description: '400 Bad Request — Error en payload o código duplicado.',
          body: formatJsonString(
            JSON.stringify({
              status: 400,
              error: 'Bad Request',
              message: 'El código de habitación "ROOM-ORD-15C" ya existe en el inventario.',
            })
          ),
        },
      },
    },
    // CRUD 2: CENTROS DE DESPACHO (SOLO ROLE_ADMIN)
    {
      id: 'admin-depots-list',
      category: '5. CRUD Centros de Hospitalidad [ROLE_ADMIN]',
      method: 'GET',
      path: '/api/v1/admin/depots',
      summary: 'Listar Todos los Centros de Hospitalidad',
      description:
        'Obtiene el balance de infraestructura de la red: capacidad de suites, ocupación y supervisor de turno.',
      requiresAuth: true,
      requiredRole: 'ROLE_ADMIN',
      responses: {
        '200': {
          description: '200 OK — Catálogo de centros de hospitalidad activos.',
          body: formatJsonString(
            JSON.stringify([
              {
                id: 1,
                code: 'ORD-01',
                name: 'Chicago Central Logistics & Suites',
                city: 'Chicago',
                state: 'IL',
                operatingStatus: 'OPERATIONAL',
                suitesCapacity: 100,
                activeUtilizationRate: 64.2,
              },
              {
                id: 2,
                code: 'ATL-04',
                name: 'Atlanta Southeast Rest & Suites Hub',
                city: 'Atlanta',
                state: 'GA',
                operatingStatus: 'OPERATIONAL',
                suitesCapacity: 90,
                activeUtilizationRate: 58.7,
              },
            ])
          ),
        },
        '403': {
          description: '403 Forbidden — Denegado: Requiere nivel de autoridad ROLE_ADMIN.',
          body: formatJsonString(
            JSON.stringify({
              timestamp: '2026-09-21T12:30:00.000Z',
              status: 403,
              error: 'Forbidden',
              message: 'Acceso Denegado: El catálogo de depósitos requiere privilegios de ROLE_ADMIN.',
              path: '/api/v1/admin/depots',
            })
          ),
        },
      },
    },
    {
      id: 'admin-depots-create',
      category: '5. CRUD Centros de Hospitalidad [ROLE_ADMIN]',
      method: 'POST',
      path: '/api/v1/admin/depots',
      summary: 'Registrar Nuevo Centro de Hospitalidad',
      description:
        'Da de alta un nuevo centro de hospitalidad en la red nacional con capacidad de suites y alojamiento.',
      requiresAuth: true,
      requiredRole: 'ROLE_ADMIN',
      sampleBody: formatJsonString(
        JSON.stringify({
          code: 'MIA-03',
          name: 'Miami Gateway Hospitality Center',
          city: 'Miami',
          state: 'FL',
          address: '4500 NW 36th St, Hospitality Center',
          supervisorName: 'Ing. Carlos Mendoza',
          supervisorPhone: '+1 (305) 555-0199',
          operatingStatus: 'OPERATIONAL',
          suitesCapacity: 90,
        })
      ),
      responses: {
        '201': {
          description: '201 Created — Centro de hospitalidad creado satisfactoriamente.',
          body: formatJsonString(
            JSON.stringify({
              id: 4,
              code: 'MIA-03',
              name: 'Miami Gateway Hospitality Center',
              city: 'Miami',
              state: 'FL',
              operatingStatus: 'OPERATIONAL',
              activeUtilizationRate: 0.0,
              createdAt: '2026-09-21T12:35:00.000Z',
            })
          ),
        },
      },
    },
  ];

  const activeDef = endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];

  // Sincronizar código de respuesta seleccionado al cambiar de endpoint
  const availableResponseCodes = Object.keys(activeDef.responses);
  const currentSelectedCode = availableResponseCodes.includes(selectedResponseCode)
    ? selectedResponseCode
    : availableResponseCodes[0] || '200';

  const handleExecute = () => {
    setIsLoading(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsLoading(false);

      // Verificación de privilegios de rol RBAC
      if (activeDef.requiredRole && session.role !== activeDef.requiredRole) {
        setTestOutput({
          status: 403,
          statusText: 'Forbidden',
          durationMs: 14,
          headers: {
            'content-type': 'application/json;charset=UTF-8',
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'DENY',
            'x-rbac-authority': activeDef.requiredRole,
          },
          curl: `curl -X ${activeDef.method} "http://localhost:8080${activeDef.path}" \\\n  -H "Authorization: Bearer ${session.accessToken.substring(0, 30)}..." \\\n  -H "Content-Type: application/json"`,
          body: formatJsonString(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              status: 403,
              error: 'Forbidden',
              message: `Acceso denegado: El usuario '${session.email}' con rol '${session.role}' carece del privilegio '${activeDef.requiredRole}'.`,
              path: activeDef.path,
              errorCode: 'FORBIDDEN_PRIVILEGE_LEVEL',
            })
          ),
        });
        return;
      }

      // Simulación de respuesta exitosa
      const successStatus =
        activeDef.method === 'POST' && activeDef.path.endsWith('/reservations')
          ? 201
          : 200;

      const responseObj =
        activeDef.responses[String(successStatus)] ||
        activeDef.responses['200'] ||
        activeDef.responses[Object.keys(activeDef.responses)[0]];

      setTestOutput({
        status: successStatus,
        statusText: successStatus === 201 ? 'Created' : 'OK',
        durationMs: Math.floor(18 + Math.random() * 25),
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
          'x-content-type-options': 'nosniff',
          'x-auth-user': session.email,
        },
        curl: `curl -X ${activeDef.method} "http://localhost:8080${activeDef.path}" \\\n  -H "Authorization: Bearer ${session.accessToken.substring(0, 30)}..." \\\n  -H "Content-Type: application/json"${
          activeDef.sampleBody ? ` \\\n  -d '${activeDef.sampleBody.replace(/\n\s*/g, '')}'` : ''
        }`,
        body: formatJsonString(responseObj.body),
      });
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              OpenAPI 3.0.1
            </span>
            <h2 className="text-lg font-bold text-slate-900">Explorador Interactivo REST Swagger / OpenAPI</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Especificación oficial de la API para backend Spring Boot 3.x, respuestas JSON con sangría estándar y validaciones de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Servidor Gateway: </span>
          <span className="font-bold text-slate-900">http://localhost:8080/api/v1</span>
        </div>
      </div>

      {/* Grid del Explorador */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista Izquierda de Endpoints (5 columnas) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Catálogo de Endpoints API
            </span>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              {endpoints.length} Rutas
            </span>
          </div>

          <div className="space-y-2">
            {endpoints.map((ep) => {
              const isSelected = ep.id === activeEndpointId;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveEndpointId(ep.id);
                    setSelectedResponseCode(Object.keys(ep.responses)[0] || '200');
                    setTestOutput(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : ep.method === 'DELETE'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-slate-800 font-semibold truncate">{ep.path}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {ep.summary}
                    </div>
                  </div>

                  {ep.requiredRole && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold shrink-0">
                      ADMIN
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalles del Endpoint y Ejecutor (7 columnas) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Cabecera del Endpoint Activo */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  activeDef.method === 'GET'
                    ? 'bg-blue-100 text-blue-700'
                    : activeDef.method === 'POST'
                    ? 'bg-emerald-100 text-emerald-700'
                    : activeDef.method === 'DELETE'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {activeDef.method}
              </span>
              <span className="font-mono text-base font-bold text-slate-900 break-all">{activeDef.path}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{activeDef.summary}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeDef.description}</p>
          </div>

          {/* Especificación de Seguridad */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Esquema de Seguridad:</span>
              <span className="font-mono font-bold text-indigo-700">
                {activeDef.requiresAuth ? 'bearerAuth (JWT Stateless)' : 'Endpoint Público (Sin Auth)'}
              </span>
            </div>
            {activeDef.requiredRole && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Autoridad Requerida:</span>
                <span className="font-mono font-bold text-amber-700">
                  {`@PreAuthorize("hasRole('${activeDef.requiredRole.replace('ROLE_', '')}')")`}
                </span>
              </div>
            )}
          </div>

          {/* CUERPO DE SOLICITUD (Request Body si aplica) con formato JSON justificado */}
          {activeDef.sampleBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[16px]">data_object</span>
                  Cuerpo de la Solicitud (Request Body)
                </span>
                <span className="text-[11px] font-mono text-slate-500">Content-Type: application/json</span>
              </div>
              <JsonCodeBlock
                json={activeDef.sampleBody}
                title="Payload de Envío"
                badge="application/json"
                badgeColor="blue"
              />
            </div>
          )}

          {/* RESPUESTAS HTTP DOCUMENTADAS (Specification Responses) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">menu_book</span>
                Respuestas HTTP Documentadas (OpenAPI Spec)
              </span>
              <span className="text-[11px] font-mono text-slate-500">Formato: JSON Justificado</span>
            </div>

            {/* Pestañas para los códigos de respuesta disponibles */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {availableResponseCodes.map((code) => {
                const isCodeSelected = currentSelectedCode === code;
                const is2xx = code.startsWith('2');
                const is4xx = code.startsWith('4');

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedResponseCode(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isCodeSelected
                        ? is2xx
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : is4xx
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>HTTP {code}</span>
                  </button>
                );
              })}
            </div>

            {/* Visualización del cuerpo de respuesta documentado en JSON formateado */}
            {activeDef.responses[currentSelectedCode] && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-600 font-medium italic">
                  {activeDef.responses[currentSelectedCode].description}
                </p>
                <JsonCodeBlock
                  json={activeDef.responses[currentSelectedCode].body}
                  title={`Esquema de Respuesta HTTP ${currentSelectedCode}`}
                  badge="application/json"
                  badgeColor={
                    currentSelectedCode.startsWith('2')
                      ? 'emerald'
                      : currentSelectedCode === '403'
                      ? 'amber'
                      : 'rose'
                  }
                />
              </div>
            )}
          </div>

          {/* CTA para Probar / Ejecutar la Solicitud */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono">
              Sesión activa: <b className="text-slate-800">{session.email}</b>{' '}
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                {session.role}
              </span>
            </div>

            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Ejecutando en Backend...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Probar / Ejecutar Endpoint</span>
                </>
              )}
            </button>
          </div>

          {/* RESULTADO DE LA EJECUCIÓN: CUERPO DE RESPUESTA EN FORMATO JSON BIEN JUSTIFICADO */}
          {testOutput && (
            <div className="p-4 sm:p-5 bg-slate-900 rounded-xl text-white font-mono text-xs space-y-4 border border-slate-800 shadow-sm animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">Estado de Respuesta:</span>
                  <span
                    className={`font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1.5 ${
                      testOutput.status >= 200 && testOutput.status < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : testOutput.status === 403
                        ? 'bg-amber-950 text-amber-400 border border-amber-700'
                        : 'bg-rose-950 text-rose-400 border border-rose-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {testOutput.status} {testOutput.statusText}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Tiempo: <b className="text-slate-200">{testOutput.durationMs}ms</b></span>
                  <span>Content-Type: <b className="text-emerald-400">application/json</b></span>
                </div>
              </div>

              {/* Comando cURL generado */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  cURL Ejecutado:
                </div>
                <pre className="text-slate-300 text-[11px] whitespace-pre-wrap break-all bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {testOutput.curl}
                </pre>
              </div>

              {/* Cabeceras de Respuesta HTTP */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                  Cabeceras de Respuesta (Response Headers):
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  {Object.entries(testOutput.headers).map(([key, val]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-sky-400 font-semibold">{key}:</span>
                      <span className="text-slate-300">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CUERPO DE LA RESPUESTA (RESPONSE BODY EN FORMATO JSON BIEN JUSTIFICADO) */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-slate-200">
                    <span className="material-symbols-outlined text-emerald-400 text-[15px]">check_circle</span>
                    Cuerpo de Respuesta (JSON Formateado y Justificado):
                  </span>
                  <span className="text-emerald-400 font-mono">application/json</span>
                </div>

                <JsonCodeBlock
                  json={testOutput.body}
                  title="Payload de Respuesta Recibido"
                  badge={`${testOutput.status} ${testOutput.statusText}`}
                  badgeColor={
                    testOutput.status >= 200 && testOutput.status < 300
                      ? 'emerald'
                      : testOutput.status === 403
                      ? 'amber'
                      : 'rose'
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

