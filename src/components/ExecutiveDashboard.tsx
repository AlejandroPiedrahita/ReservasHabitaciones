import React, { useState } from 'react';
import { Asset, Depot, Reservation, Role, TelemetryAlert, UserSession } from '../types';

interface ExecutiveDashboardProps {
  session: UserSession;
  depots: Depot[];
  assets: Asset[];
  reservations: Reservation[];
  alerts: TelemetryAlert[];
  onOpenNewReservation: () => void;
  onSelectReservation: (res: Reservation) => void;
  onFastDispatch: (id: number) => void;
  onApproveReservation: (id: number) => void;
  onSwitchRole: (newRole: Role) => void;
  onAlertAction: (alertId: string, actionName: string) => void;
  onNavigateToCarousel?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  session,
  depots,
  assets,
  reservations,
  alerts,
  onOpenNewReservation,
  onSelectReservation,
  onFastDispatch,
  onApproveReservation,
  onSwitchRole,
  onAlertAction,
  onNavigateToCarousel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.reservationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destinationOrRoom.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAdmin = session.role === 'ROLE_ADMIN';

  // Cálculos dinámicos en base a datos reales (inician en 0 para testing)
  const totalCapacity = depots.reduce(
    (acc, d) => acc + d.suitesCapacity,
    0
  );
  const totalActiveUnits = depots.reduce(
    (acc, d) => acc + d.suitesActive,
    0
  );
  const utilizationRate =
    totalCapacity > 0 ? ((totalActiveUnits / totalCapacity) * 100).toFixed(1) : '0.0';

  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Top Context & Fast Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">hotel</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Comando de Operaciones Regionales</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ventana de Despacho Activa
              </span>
              <span className="hidden md:inline-block text-xs font-mono text-slate-400">
                UTC-05:00 Operaciones Este
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bloqueo de inventario hotelero y cumplimiento estricto de SLA Zero-Trust.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Quick Role Toggle for Testing */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => onSwitchRole('ROLE_ADMIN')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                isAdmin ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Modo Admin
            </button>
            <button
              onClick={() => onSwitchRole('ROLE_CLIENTE')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                !isAdmin ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Modo Cliente
            </button>
          </div>

          {onNavigateToCarousel && (
            <button
              onClick={onNavigateToCarousel}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs shadow-sm transition-all"
              title="Explorar el Carrusel de Compra y Catálogo de Suites"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">hotel_class</span>
              <span>Carrusel de Compra</span>
            </button>
          )}

          <button
            onClick={onOpenNewReservation}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* 4 TOP KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Utilización de Suites y Habitaciones</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-600">pie_chart</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{utilizationRate}%</span>
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              Capacidad Base
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
            <span>Activas: {totalActiveUnits} unidades</span>
            <span>Total: {totalCapacity} unidades</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tasa de Salida Puntual</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">timer</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {reservations.length === 0 ? '100.0%' : '99.2%'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <span className="material-symbols-outlined text-[14px]">check</span>
              SLA Óptimo
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
            <span>Meta SLA: 98.5%</span>
            <span className="text-slate-500">Desviaciones: 0</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ritmo de Ingresos Facturados</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">payments</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {reservations.length} Reservas
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
            <span>Base Test: $0.00</span>
            <span>Día de Inicio</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Alertas Operativas Activas</span>
            <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeAlertsCount}</span>
            <span className={`text-xs font-semibold ${activeAlertsCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {activeAlertsCount === 0 ? 'Sistemas Óptimos' : 'Cuellos de Botella'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
            <span>{alerts.length} Totales</span>
            <span>0 Críticas</span>
          </div>
        </div>
      </div>

      {/* REGIONAL HOSPITALITY HUBS (NORTH AMERICA DEPOT OPERATIONS) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operaciones de Centros Regionales</h3>
            <p className="text-xs text-slate-500">Utilización de capacidad activa de habitaciones en tiempo real</p>
          </div>
          <span className="text-xs font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md font-semibold">
            3 Centros Activos Sincronizados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {depots.map((depot) => (
            <div
              key={depot.id}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                    {depot.code}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{depot.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {depot.activeUtilizationRate}% Activo
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${depot.activeUtilizationRate}%` }}
                ></div>
              </div>

              {/* Metric Breakdown Pills */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">hotel</span>
                    Suites de Hospitalidad
                  </span>
                  <span className="font-mono font-semibold">
                    {depot.suitesActive} / {depot.suitesCapacity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OPERATIONAL FAST-ACTION COMMAND STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => alert('Concierge de guardia asignado a la cola de servicio activa.')}
          className="p-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-semibold">Conserjería de Guardia</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              badge
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">Asignar a reserva activa</span>
        </button>

        <button
          onClick={() => alert('Bloqueo de suite de emergencia liberado.')}
          className="p-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-semibold">Suite de Emergencia</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              meeting_room
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">Liberar bloqueo temporal</span>
        </button>

        <button
          onClick={() => alert('Ping de sincronización de cerraduras IoT iniciado en las suites de la red.')}
          className="p-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-semibold">Sincronización IoT</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              sync
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">Forzar Ping de Cerraduras</span>
        </button>

        <button
          onClick={() => alert('Todos los microservicios y réplicas de lectura de base de datos verificados operando con normalidad.')}
          className="p-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Salud del Sistema</span>
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Microservicios 100% OK</span>
        </button>
      </div>

      {/* MIDDLE SPLIT: LIVE INCIDENTS & TELEMETRY HARDWARE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Alerts (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-rose-600">notifications_active</span>
              <h3 className="text-sm font-bold text-slate-900">Transmisión de Incidentes y Alertas</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Actualización auto: 5s</span>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50/80 rounded-lg border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-3xl text-emerald-500 mb-2">verified</span>
                <p className="text-xs font-bold text-slate-800">No hay alertas ni incidentes activos</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Entorno limpio con 0 incidentes activos para realizar testeos de reservas, colisiones y rotación de suites.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-lg border text-xs transition-colors ${
                    alert.resolved
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : alert.severity === 'CRITICAL'
                      ? 'bg-rose-50/60 border-rose-200'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-blue-50/60 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-200 text-rose-800'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {alert.title}
                      </span>
                      <span className="text-slate-400 font-mono font-normal">{alert.timestamp}</span>
                    </div>

                    {alert.resolved && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        {alert.resolutionNote || 'Resuelto'}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-700 leading-relaxed mb-2.5">{alert.description}</p>

                  {!alert.resolved && (
                    <div className="flex items-center gap-2">
                      {alert.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => onAlertAction(alert.id, act)}
                          className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                            i === 0
                              ? 'bg-[#091426] text-white hover:bg-slate-800'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hospitality IoT Hardware Stats (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Hardware IoT de Hospitalidad</h3>
            <p className="text-xs text-slate-500 mb-4">Estado de cerraduras inteligentes y sensores de las suites en la red</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Cerraduras Inteligentes de Suite</span>
                  <span className="font-mono font-bold text-emerald-600">99.9% En Línea</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Sensores de Ocupación y Climatización</span>
                  <span className="font-mono font-bold text-emerald-600">100% Conformes</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Hubs de Cerraduras Inteligentes</span>
                  <span className="font-mono font-bold text-blue-600">97.8% En Línea</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '97.8%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
              <span>Nodo de Respaldo Satelital:</span>
              <span className="font-mono font-semibold text-slate-900">Enlace Satelital Iridium</span>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-HUB RESERVATIONS TABLE (IMAGE 9) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar reservas, suites, cliente..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'TODOS' },
              { id: 'PENDING', label: 'PENDIENTES' },
              { id: 'CONFIRMED', label: 'CONFIRMADOS' },
              { id: 'IN_TRANSIT', label: 'EN TRÁNSITO' },
              { id: 'COMPLETED', label: 'COMPLETADOS' },
              { id: 'CANCELLED', label: 'CANCELADOS' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  statusFilter === st.id
                    ? 'bg-[#091426] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Código de Reserva</th>
                <th className="py-3 px-4">Suite y Habitación</th>
                <th className="py-3 px-4">Cliente Corporativo</th>
                <th className="py-3 px-4">Ventana / Destino</th>
                <th className="py-3 px-4">Concierge Asignado</th>
                <th className="py-3 px-4">Monto Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-2.5">
                      <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">inbox</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {reservations.length === 0
                          ? 'No hay reservas registradas (0 registros de prueba)'
                          : 'No se encontraron reservas con los filtros seleccionados'}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {reservations.length === 0
                          ? 'Todos los datos han sido reiniciados a 0 para realizar testeos limpios. Utilice el botón superior "+ Nueva Reserva" para crear despachos y validar colisiones.'
                          : 'Pruebe limpiando la barra de búsqueda o restableciendo el filtro a "Todos los Estados".'}
                      </p>
                      {reservations.length === 0 && (
                        <button
                          onClick={onOpenNewReservation}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                          + Crear Primera Reserva de Test
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {res.reservationCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{res.assetName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{res.assetIdentifier}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {res.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{res.destinationOrRoom}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →{' '}
                        {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {res.assignedConcierge || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${res.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          res.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : res.status === 'IN_TRANSIT'
                            ? 'bg-amber-100 text-amber-800'
                            : res.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            res.status === 'PENDING'
                              ? 'bg-amber-500 animate-pulse'
                              : res.status === 'IN_TRANSIT'
                              ? 'bg-amber-500 animate-pulse'
                              : res.status === 'CONFIRMED'
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        {res.status === 'PENDING'
                          ? 'PENDIENTE'
                          : res.status === 'IN_TRANSIT'
                          ? 'EN TRÁNSITO'
                          : res.status === 'CONFIRMED'
                          ? 'CONFIRMADO'
                          : res.status === 'COMPLETED'
                          ? 'COMPLETADO'
                          : 'CANCELADO'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === 'PENDING' && (
                          <button
                            onClick={() => onApproveReservation(res.id)}
                            disabled={!isAdmin}
                            title={!isAdmin ? 'La aprobación requiere privilegios ROLE_ADMIN' : 'Aprobar reserva del cliente'}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors disabled:opacity-40 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Aprobar
                          </button>
                        )}
                        {res.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onFastDispatch(res.id)}
                            disabled={!isAdmin}
                            title={!isAdmin ? 'El despacho rápido requiere privilegios ROLE_ADMIN' : 'Despachar de inmediato'}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 transition-colors disabled:opacity-40"
                          >
                            Despachar
                          </button>
                        )}
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
