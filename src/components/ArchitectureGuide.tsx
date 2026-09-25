import React from 'react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title & Introduction */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200">
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          Guía de Arquitectura de Ingeniería y Operaciones del Sistema
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Cómo Funciona ReserveHub Enterprise
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
          ReserveHub Enterprise está diseñado bajo una estricta <b>Arquitectura Limpia (Arquitectura Hexagonal)</b> en Spring Boot 3.x y Java 21 LTS. Garantiza cero reservas duplicadas mediante un motor automatizado de colisiones sobrepuestas, aplica control de acceso stateless JWT Zero-Trust y sincroniza el inventario de suites de hospitalidad con cerraduras inteligentes IoT.
        </p>
      </div>

      {/* 1. CLEAN / HEXAGONAL ARCHITECTURE LAYER ISOLATION */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
            1
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Arquitectura Limpia: Separación Hexagonal de Responsabilidades
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          La aplicación sigue el Principio de Inversión de Dependencias: las reglas internas del dominio tienen cero dependencias de bases de datos externas, frameworks web o SDKs de terceros.
        </p>

        {/* Visual Layer Diagram */}
        <div className="p-6 bg-slate-900 rounded-xl text-white font-mono text-xs overflow-x-auto space-y-4 border border-slate-800">
          <div className="text-center font-bold text-indigo-400 uppercase tracking-widest text-[11px] pb-2 border-b border-slate-800">
            Flujo de Capas de Cebolla Hexagonal
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Infrastructure */}
            <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-indigo-400 font-bold mb-1">INFRAESTRUCTURA</div>
              <div className="text-[10px] text-slate-400 mb-2">Adaptadores, Web, BD, Seguridad</div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="bg-slate-900/60 p-1.5 rounded">ReservationController</div>
                <div className="bg-slate-900/60 p-1.5 rounded">JwtAuthenticationFilter</div>
                <div className="bg-slate-900/60 p-1.5 rounded">ReservationJpaRepository</div>
                <div className="bg-slate-900/60 p-1.5 rounded">PostgreSQL / Redis</div>
              </div>
            </div>

            {/* Application */}
            <div className="p-4 bg-indigo-950/60 rounded-lg border border-indigo-700/60">
              <div className="text-emerald-400 font-bold mb-1">APLICACIÓN</div>
              <div className="text-[10px] text-slate-400 mb-2">Casos de Uso, Puertos y DTOs</div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="bg-slate-900/60 p-1.5 rounded">ReservationUseCase (In-Port)</div>
                <div className="bg-slate-900/60 p-1.5 rounded">ReservationService (Impl)</div>
                <div className="bg-slate-900/60 p-1.5 rounded">ReservationRepoPort (Out)</div>
                <div className="bg-slate-900/60 p-1.5 rounded">DTOs Request / Response</div>
              </div>
            </div>

            {/* Domain */}
            <div className="p-4 bg-emerald-950/60 rounded-lg border border-emerald-700/60">
              <div className="text-amber-400 font-bold mb-1">DOMINIO (NÚCLEO)</div>
              <div className="text-[10px] text-slate-400 mb-2">Invariantes Puras de Negocio</div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="bg-slate-900/60 p-1.5 rounded">Agregado Reservation</div>
                <div className="bg-slate-900/60 p-1.5 rounded">Entidades Asset / Depot / User</div>
                <div className="bg-slate-900/60 p-1.5 rounded">Enum ReservationStatus</div>
                <div className="bg-slate-900/60 p-1.5 rounded">Excepciones de Dominio</div>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Las dependencias apuntan exclusivamente hacia adentro: <span className="text-indigo-300">Infraestructura → Aplicación → Dominio</span>. El Dominio no depende de nada.
          </div>
        </div>
      </div>

      {/* 2. OVERLAPPING COLLISION DETECTION ENGINE */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
            2
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Motor de Detección de Colisiones Sobrepuestas y Margen de 35 Minutos
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Para evitar la doble reserva de suites ejecutivas y habitaciones de descanso, el sistema evalúa algoritmos de sobreposición temporal antes de la persistencia en base de datos. Además, impone un <b>margen obligatorio de 35 minutos de rotación e higienización</b> entre reservas consecutivas sobre la misma unidad física.
        </p>

        {/* Visual Timeline Diagram */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="text-xs font-semibold text-slate-700">LÍNEA TEMPORAL DE DETECCIÓN DE COLISIONES:</div>

          {/* Existing allocation */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Reserva Existente (08:00 - 16:00)</span>
              <span className="text-emerald-700 font-bold">BLOQUEADA Y CONFIRMADA</span>
            </div>
            <div className="flex h-8 rounded-lg overflow-hidden border border-slate-300 font-mono text-[10px] text-center font-bold">
              <div className="w-[10%] bg-amber-200 flex items-center justify-center text-amber-900">
                -35m
              </div>
              <div className="w-[75%] bg-indigo-600 text-white flex items-center justify-center">
                VENTANA ACTIVA DE RESERVA (Suite 14B)
              </div>
              <div className="w-[15%] bg-amber-200 flex items-center justify-center text-amber-900">
                +35m Margen
              </div>
            </div>
          </div>

          {/* Attempt 1: Conflict */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Intento de Reserva Candidata (14:00 - 20:00)</span>
              <span className="text-rose-600 font-bold">❌ 409 CONFLICTO (Rechazada)</span>
            </div>
            <div className="flex h-7 rounded-lg overflow-hidden border border-rose-300 font-mono text-[10px] text-center font-bold">
              <div className="w-[45%] bg-transparent"></div>
              <div className="w-[50%] bg-rose-500 text-white flex items-center justify-center">
                INTERSECCIÓN DE COLISIÓN
              </div>
            </div>
          </div>

          {/* Attempt 2: Valid */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Intento de Reserva Candidata (17:00 - 22:00)</span>
              <span className="text-emerald-600 font-bold">✅ 201 CREADA (Confirmada)</span>
            </div>
            <div className="flex h-7 rounded-lg overflow-hidden border border-emerald-300 font-mono text-[10px] text-center font-bold">
              <div className="w-[65%] bg-transparent"></div>
              <div className="w-[35%] bg-emerald-500 text-white flex items-center justify-center">
                VENTANA DE HIGIENIZACIÓN LIBRE
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded border border-slate-200 text-xs font-mono text-slate-700">
            <span className="text-indigo-600 font-bold">Invariante Matemática:</span> inicioCandidato &lt; (finExistente + 35min) &amp;&amp; finCandidato &gt; (inicioExistente - 35min)
          </div>
        </div>
      </div>

      {/* 3. ZERO-TRUST STATELESS SECURITY */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
            3
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Autenticación Stateless JWT y Pipeline de Autorización RBAC
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          El backend mantiene cero estado de sesión HTTP del lado del servidor. Cada solicitud entrante debe proporcionar un token JWT auténtico y firmado criptográficamente a través del encabezado <code>Authorization: Bearer</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-indigo-700 mb-1">Paso 1: Handshake Auth</div>
            <p className="text-slate-600 text-[11px]">
              El usuario envía email, contraseña hasheada con BCrypt y token TOTP de 6 dígitos a <code>POST /auth/login</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-indigo-700 mb-1">Paso 2: Emisión de Token</div>
            <p className="text-slate-600 text-[11px]">
              El servidor valida credenciales y emite un JWT HS256 que contiene los claims de rol y el ID de terminal.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-indigo-700 mb-1">Paso 3: Extracción en Filtro</div>
            <p className="text-slate-600 text-[11px]">
              <code>JwtAuthenticationFilter</code> intercepta la solicitud, parsea los claims y establece el <code>SecurityContext</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-indigo-700 mb-1">Paso 4: @PreAuthorize</div>
            <p className="text-slate-600 text-[11px]">
              Métodos como <code>/dispatch</code> verifican <code>hasRole('ADMIN')</code>, arrojando 403 Forbidden a clientes sin permiso.
            </p>
          </div>
        </div>
      </div>

      {/* 4. REDIS CACHE & RESILIENCE */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
            4
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Almacenamiento Relacional PostgreSQL y Capa de Bloqueo Distribuido con Redis 7
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          PostgreSQL almacena los despachos históricos canónicos, el catálogo de depósitos y las entidades de usuario con consultas compuestas indexadas (<code>idx_res_asset_time</code>). Redis 7 gestiona el bloqueo mutex distribuido durante solicitudes concurrentes de reserva, asegurando que ninguna condición de carrera eluda las validaciones de sobreposición en entornos de alto rendimiento.
        </p>
      </div>
    </div>
  );
};
