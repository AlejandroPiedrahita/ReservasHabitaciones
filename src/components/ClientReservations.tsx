import React, { useState } from 'react';
import { Reservation, PaymentReceipt } from '../types';
import { PaymentDrawer } from './PaymentDrawer';

interface ClientReservationsProps {
  reservations: Reservation[];
  currentUserEmail: string;
  customerName: string;
  onPayReservation: (id: number, payment?: PaymentReceipt) => void;
  onCancelReservation: (id: number) => void;
  onNavigateToCarousel: () => void;
}

type ClientFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'PAID' | 'HISTORY';

export const ClientReservations: React.FC<ClientReservationsProps> = ({
  reservations,
  currentUserEmail,
  customerName,
  onPayReservation,
  onCancelReservation,
  onNavigateToCarousel,
}) => {
  const [activeFilter, setActiveFilter] = useState<ClientFilter>('ALL');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  const canCancelReservation = (r: Reservation): boolean =>
    (r.status === 'PENDING' || r.status === 'CONFIRMED') && r.paymentStatus !== 'PAID';

  // Only reservations belonging to the logged-in client
  const myReservations = reservations.filter(
    (r) => r.userEmail === currentUserEmail || r.userId === 1 || r.userId === 2
  );

  const matchesFilter = (r: Reservation, filter: ClientFilter): boolean => {
    switch (filter) {
      case 'PENDING':
        return r.status === 'PENDING';
      case 'CONFIRMED':
        return r.status === 'CONFIRMED' && r.paymentStatus !== 'PAID';
      case 'PAID':
        return r.paymentStatus === 'PAID' && r.status !== 'CANCELLED';
      case 'HISTORY':
        return r.status === 'COMPLETED' || r.status === 'CANCELLED';
      default:
        return true;
    }
  };

  const filtered = myReservations.filter((r) => matchesFilter(r, activeFilter));

  const counts = {
    ALL: myReservations.length,
    PENDING: myReservations.filter((r) => r.status === 'PENDING').length,
    CONFIRMED: myReservations.filter((r) => r.status === 'CONFIRMED' && r.paymentStatus !== 'PAID').length,
    PAID: myReservations.filter((r) => r.paymentStatus === 'PAID' && r.status !== 'CANCELLED').length,
    HISTORY: myReservations.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED').length,
  };

  const pendingPaymentCount = counts.CONFIRMED;

  const getStatusBadge = (r: Reservation) => {
    if (r.status === 'PENDING') {
      return { label: 'PENDIENTE DE APROBACIÓN', cls: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500 animate-pulse' };
    }
    if (r.status === 'CANCELLED') {
      return { label: 'CANCELADA', cls: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
    }
    if (r.status === 'COMPLETED') {
      return { label: 'COMPLETADA', cls: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-400' };
    }
    if (r.paymentStatus === 'PAID') {
      return { label: 'PAGADA', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    }
    // CONFIRMED but not paid
    return { label: 'APROBADA — PAGO PENDIENTE', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500 animate-pulse' };
  };

  return (
    <div className="space-y-6">
      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-[#091426] via-[#102444] to-[#1e1b4b] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <span className="material-symbols-outlined text-[14px]">bookmark_heart</span>
                MIS RESERVAS
              </span>
              {pendingPaymentCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <span className="material-symbols-outlined text-[14px]">payments</span>
                  {pendingPaymentCount} pago(s) pendiente(s)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Panel de Reservas del Cliente
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consulta el estado de tus solicitudes. Una vez que el administrador apruebe tu reserva, podrás
              continuar con el pago en línea para confirmar definitivamente tu suite o vehículo.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs">
            <div className="flex justify-between sm:gap-6">
              <span className="text-slate-300">Cuenta:</span>
              <span className="font-bold font-mono text-white truncate max-w-[140px]" title={customerName}>
                {customerName}
              </span>
            </div>
            <div className="flex justify-between sm:gap-6">
              <span className="text-slate-300">Total Reservas:</span>
              <span className="font-bold font-mono text-emerald-400">{myReservations.length}</span>
            </div>
            <div className="flex justify-between sm:gap-6">
              <span className="text-slate-300">Aprobadas:</span>
              <span className="font-bold font-mono text-indigo-300">{counts.PAID + counts.CONFIRMED}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {[
          { id: 'ALL' as ClientFilter, label: 'Todas', icon: 'apps' },
          { id: 'PENDING' as ClientFilter, label: 'Pendientes de Aprobación', icon: 'hourglass_top' },
          { id: 'CONFIRMED' as ClientFilter, label: 'Aprobadas · Pago Pendiente', icon: 'payments' },
          { id: 'PAID' as ClientFilter, label: 'Pagadas', icon: 'verified' },
          { id: 'HISTORY' as ClientFilter, label: 'Historial', icon: 'history' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeFilter === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <span className="material-symbols-outlined text-[15px]">{f.icon}</span>
            <span>{f.label}</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {/* RESERVATIONS LIST */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {myReservations.length === 0
              ? 'Aún no tienes reservas registradas'
              : 'No hay reservas con este filtro'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {myReservations.length === 0
              ? 'Explora el catálogo y reserva tu primera suite o vehículo. Tu solicitud quedará pendiente de aprobación por el administrador.'
              : 'Prueba seleccionando otro filtro o la pestaña "Todas".'}
          </p>
          {myReservations.length === 0 && (
            <button
              onClick={onNavigateToCarousel}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">hotel_class</span>
              Ir al Carrusel de Compra
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const badge = getStatusBadge(r);
            const canPay = r.status === 'CONFIRMED' && r.paymentStatus !== 'PAID';
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {r.reservationCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 truncate">{r.assetName}</h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{r.destinationOrRoom}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      ${r.totalAmount.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">USD total</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 grid grid-cols-2 gap-3 text-xs flex-1">
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">Inicio</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(r.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">Fin</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(r.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">Centro</span>
                    <span className="font-semibold text-slate-800">{r.depotCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">Pago</span>
                    <span
                      className={`font-semibold ${
                        r.status === 'CANCELLED'
                          ? 'text-rose-700'
                          : r.paymentStatus === 'PAID'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {r.status === 'CANCELLED'
                        ? 'CANCELADO'
                        : r.paymentStatus === 'PAID'
                        ? 'PAGADO'
                        : 'PENDIENTE'}
                    </span>
                  </div>
                </div>

                {/* Card Footer / Actions */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedReservation(r)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    Ver Detalle
                  </button>

                  <div className="flex items-center gap-2">
                    {canCancelReservation(r) && (
                      <button
                        onClick={() => setCancelTarget(r)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Cancelar Reserva
                      </button>
                    )}
                    {canPay && (
                      <button
                        onClick={() => setPaymentTarget(r)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">credit_card</span>
                        Continuar con el Pago
                      </button>
                    )}
                    {r.paymentStatus === 'PAID' && r.status !== 'CANCELLED' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Pago Confirmado
                      </span>
                    )}
                  </div>
                </div>

                {r.paymentStatus === 'PAID' && r.paymentReceipt && (
                  <div className="px-4 py-2 border-t border-slate-100 bg-emerald-50/50 text-[10px] font-mono text-emerald-800 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                      {r.paymentReceipt.transactionId}
                    </span>
                    <span className="shrink-0 font-bold">{r.paymentReceipt.method} ****{r.paymentReceipt.last4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {selectedReservation.reservationCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{selectedReservation.assetName}</h3>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado de Reserva:</span>
                  <span className="font-bold text-slate-800">{selectedReservation.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado de Pago:</span>
                  <span
                    className={`font-bold ${
                      selectedReservation.status === 'CANCELLED'
                        ? 'text-rose-700'
                        : selectedReservation.paymentStatus === 'PAID'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {selectedReservation.status === 'CANCELLED'
                      ? 'CANCELADO'
                      : selectedReservation.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Horario:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {new Date(selectedReservation.startTime).toLocaleString()} →{' '}
                    {new Date(selectedReservation.endTime).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">Tarifa Base</span>
                  <span className="font-mono">${selectedReservation.baseCost.toFixed(2)}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">Servicios y Coberturas</span>
                  <span className="font-mono">
                    ${(selectedReservation.serviceFee + selectedReservation.insuranceFee).toFixed(2)}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 flex justify-between font-bold text-slate-900">
                  <span>Monto Total</span>
                  <span className="font-mono text-indigo-700">${selectedReservation.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block">Notas del Manifiesto</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                  {selectedReservation.manifestNotes || 'Sin notas registradas.'}
                </p>
              </div>

              {selectedReservation.paymentStatus === 'PAID' && selectedReservation.paymentReceipt && (
                <div className="border border-emerald-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    Comprobante de Pago
                  </div>
                  <div className="p-3 text-xs font-mono text-slate-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transacción:</span>
                      <span className="font-bold">{selectedReservation.paymentReceipt.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Método:</span>
                      <span className="font-bold">{selectedReservation.paymentReceipt.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Referencia:</span>
                      <span className="font-bold">****{selectedReservation.paymentReceipt.last4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fecha:</span>
                      <span className="font-bold">{new Date(selectedReservation.paymentReceipt.paidAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              {canCancelReservation(selectedReservation) && (
                <button
                  onClick={() => {
                    setCancelTarget(selectedReservation);
                    setSelectedReservation(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Cancelar Reserva
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {selectedReservation.status === 'CONFIRMED' && selectedReservation.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => {
                      setPaymentTarget(selectedReservation);
                      setSelectedReservation(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    Continuar con el Pago
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION DIALOG */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setCancelTarget(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar cancelación de reserva"
          >
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">¿Cancelar esta reserva?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estás a punto de cancelar la reserva{' '}
                <span className="font-mono font-bold text-indigo-700">{cancelTarget.reservationCode}</span> (
                {cancelTarget.assetName}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  onCancelReservation(cancelTarget.id);
                  setCancelTarget(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT DRAWER */}
      <PaymentDrawer
        reservation={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirmPayment={(id, payment) => onPayReservation(id, payment)}
      />
    </div>
  );
};

export default ClientReservations;
