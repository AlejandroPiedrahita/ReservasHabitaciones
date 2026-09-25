import React from 'react';
import { Reservation, Role } from '../types';

interface ReservationDetailDrawerProps {
  reservation: Reservation | null;
  onClose: () => void;
  userRole: Role;
  onDispatch: (id: number) => void;
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
  onDelete: (id: number) => void;
  onApprove?: (id: number) => void;
}

export const ReservationDetailDrawer: React.FC<ReservationDetailDrawerProps> = ({
  reservation,
  onClose,
  userRole,
  onDispatch,
  onComplete,
  onCancel,
  onDelete,
  onApprove,
}) => {
  if (!reservation) return null;

  const isAdmin = userRole === 'ROLE_ADMIN';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {reservation.reservationCode}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  reservation.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : reservation.status === 'IN_TRANSIT'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : reservation.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : reservation.status === 'COMPLETED'
                    ? 'bg-slate-100 text-slate-800 border border-slate-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {reservation.status === 'PENDING'
                  ? 'PENDIENTE DE APROBACIÓN'
                  : reservation.status === 'IN_TRANSIT'
                  ? 'EN TRÁNSITO'
                  : reservation.status === 'CONFIRMED'
                  ? 'CONFIRMADO'
                  : reservation.status === 'COMPLETED'
                  ? 'COMPLETADO'
                  : 'CANCELADO'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{reservation.assetName}</h2>
            <p className="text-xs text-slate-500 font-mono">ID de Activo: {reservation.assetIdentifier}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-sm">
          {/* Dispatch Corridor & Operator Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 block font-semibold">Cliente Corporativo</span>
              <span className="text-slate-900 font-bold block mt-1">{reservation.customerName}</span>
              <span className="text-xs text-slate-500 font-mono">{reservation.userEmail}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 block font-semibold">Centro de Despacho / Estación</span>
              <span className="text-slate-900 font-bold block mt-1">Centro {reservation.depotCode}</span>
              <span className="text-xs text-slate-500 font-mono">Puerta de Embarque 04</span>
            </div>
          </div>

          {/* Time Window */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-slate-600">ASIGNACIÓN HORARIA Y MARGEN DE HIGIENIZACIÓN</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">INICIO DE DESPACHO</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {new Date(reservation.startTime).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">FINALIZACIÓN ESTIMADA</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {new Date(reservation.endTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Line-Item Pricing Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Desglose Detallado de Facturación
              </h3>
              <span className="text-xs font-mono text-emerald-600 font-semibold">Garantizado por SLA</span>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              <div className="p-3 flex justify-between text-xs">
                <span className="text-slate-600">Tarifa Base de Asignación del Activo</span>
                <span className="font-mono font-medium">${reservation.baseCost.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between text-xs">
                <span className="text-slate-600">Servicio de Higienización y Conserjería</span>
                <span className="font-mono font-medium">${reservation.serviceFee.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between text-xs">
                <span className="text-slate-600">Seguro Integral de Estancia / Suite Nivel 4</span>
                <span className="font-mono font-medium">${reservation.insuranceFee.toFixed(2)}</span>
              </div>
              <div className="p-3.5 bg-slate-50 flex justify-between text-sm font-bold text-slate-900">
                <span>Monto Total de Factura</span>
                <span className="font-mono text-indigo-700 text-base">${reservation.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div
              className={`mt-2 p-3 rounded-lg border text-xs flex items-center justify-between ${
                reservation.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-[16px]">
                  {reservation.paymentStatus === 'PAID' ? 'verified' : 'pending_actions'}
                </span>
                Estado de Pago del Cliente
              </span>
              <span className="font-bold font-mono">
                {reservation.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE DE PAGO'}
              </span>
            </div>
          </div>

          {/* Operational Route & Notes */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Conserjería Asignada</span>
              <span className="text-slate-800 font-medium">{reservation.assignedConcierge || 'Sin asignar'}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">Corredor de Destino / Habitación</span>
              <span className="text-slate-800 font-medium">{reservation.destinationOrRoom}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">Notas del Manifiesto</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                {reservation.manifestNotes || 'No se registraron notas específicas.'}
              </p>
            </div>
          </div>

          {/* RBAC Notice */}
          {!isAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Las acciones de Despacho Rápido y Eliminación requieren privilegios de <b>ROLE_ADMIN</b>.</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          {isAdmin && (
            <button
              onClick={() => onDelete(reservation.id)}
              className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Eliminar Manifiesto
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {isAdmin && reservation.status === 'PENDING' && onApprove && (
              <button
                onClick={() => onApprove(reservation.id)}
                title="Aprobar y confirmar la reserva del cliente"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Aprobar Reserva
              </button>
            )}

            {isAdmin && reservation.status === 'CONFIRMED' && (
              <button
                onClick={() => onDispatch(reservation.id)}
                title="Despachar de inmediato"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                Despacho Rápido
              </button>
            )}

            {reservation.status === 'IN_TRANSIT' && (
              <button
                onClick={() => onComplete(reservation.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Completar Misión
              </button>
            )}

            {reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && (
              <button
                onClick={() => onCancel(reservation.id)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar Reserva
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
