import React, { useEffect, useMemo, useState } from 'react';
import { Reservation, PaymentReceipt } from '../types';

export type { PaymentReceipt };

type PaymentMethod = 'CARD' | 'PAYPAL' | 'TRANSFER';
type ProcessingState = 'IDLE' | 'PROCESSING' | 'APPROVED' | 'REJECTED';

interface CardFormState {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
}

interface PaymentDrawerProps {
  reservation: Reservation | null;
  onClose: () => void;
  onConfirmPayment: (id: number, payment: PaymentReceipt) => void;
}

const TEST_CARD: CardFormState = {
  holder: 'JUAN PEREZ',
  number: '4242 4242 4242 4242',
  expiry: '12/29',
  cvv: '123',
};

const REJECTED_CARD_NUMBER = '4000000000000002';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; hint: string }[] = [
  { id: 'CARD', label: 'Tarjeta de Crédito / Débito', icon: 'credit_card', hint: 'Visa · Mastercard · Amex' },
  { id: 'PAYPAL', label: 'PayPal', icon: 'account_balance_wallet', hint: 'Pago con saldo de tu cuenta' },
  { id: 'TRANSFER', label: 'Transferencia Bancaria', icon: 'account_balance', hint: 'SPEI / SWIFT (simulado)' },
];

/** Format the card number as groups of 4 digits, keeping max 16 digits. */
const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

/** Format the expiry as MM/AA. */
const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

/** Luhn algorithm for basic card number validation. */
const luhnCheck = (digits: string): boolean => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

/** Check the expiry is a valid future date (MM/AA). */
const isFutureExpiry = (value: string): boolean => {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59);
  return lastDayOfMonth >= now;
};

const generateTransactionId = (): string =>
  'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  reservation,
  onClose,
  onConfirmPayment,
}) => {
  const isOpen = reservation !== null;

  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [card, setCard] = useState<CardFormState>({ holder: '', number: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormState, string>>>({});
  const [state, setState] = useState<ProcessingState>('IDLE');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key (unless a payment is being processed)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'PROCESSING') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, state]);

  // Reset the form whenever a new reservation is targeted
  useEffect(() => {
    if (reservation) {
      setMethod('CARD');
      setCard({ holder: '', number: '', expiry: '', cvv: '' });
      setErrors({});
      setState('IDLE');
      setReceipt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.id]);

  const cardDigits = useMemo(() => card.number.replace(/\D/g, ''), [card.number]);

  if (!reservation) return null;

  const validateCard = (): boolean => {
    const next: Partial<Record<keyof CardFormState, string>> = {};
    if (!card.holder.trim()) next.holder = 'Ingresa el nombre del titular.';
    if (cardDigits.length !== 16 || !luhnCheck(cardDigits)) next.number = 'Número de tarjeta inválido (16 dígitos).';
    if (!isFutureExpiry(card.expiry)) next.expiry = 'Fecha inválida o vencida (MM/AA).';
    if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = 'CVV inválido (3 o 4 dígitos).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'CARD' && !validateCard()) return;

    setState('PROCESSING');
    // Simulated gateway latency
    window.setTimeout(() => {
      const isRejected = method === 'CARD' && cardDigits === REJECTED_CARD_NUMBER;
      if (isRejected) {
        setState('REJECTED');
        setErrors({ number: 'La tarjeta fue rechazada por el emisor. Intenta con otra tarjeta.' });
        return;
      }
      const newReceipt: PaymentReceipt = {
        method,
        last4: method === 'CARD' ? cardDigits.slice(-4) : method === 'PAYPAL' ? 'PPAL' : 'BANK',
        transactionId: generateTransactionId(),
        paidAt: new Date().toISOString(),
      };
      setReceipt(newReceipt);
      setState('APPROVED');
    }, 2000);
  };

  const handleFinish = () => {
    if (!receipt) return;
    onConfirmPayment(reservation.id, receipt);
    onClose();
  };

  const canClose = state !== 'PROCESSING';

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Ventana de pago"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {reservation.reservationCode}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-100 text-indigo-800 border-indigo-300">
                <span className="material-symbols-outlined text-[14px]">credit_card</span>
                PAGO EN LÍNEA
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">{reservation.assetName}</h2>
            <p className="text-xs text-slate-500 font-mono">{reservation.destinationOrRoom}</p>
          </div>
          <button
            onClick={onClose}
            disabled={!canClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Cerrar ventana de pago"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-sm">
          {/* Amount summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Tarifa Base</span>
              <span className="font-mono">${reservation.baseCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Servicios y Coberturas</span>
              <span className="font-mono">
                ${(reservation.serviceFee + reservation.insuranceFee).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800">Monto Total</span>
              <span className="font-mono font-bold text-indigo-700 text-base">
                ${reservation.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Processing overlay */}
          {state === 'PROCESSING' && (
            <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-[36px] text-indigo-600 animate-spin">
                progress_activity
              </span>
              <p className="text-xs font-semibold text-indigo-800">Procesando el pago…</p>
              <p className="text-[11px] text-indigo-600">No cierres esta ventana.</p>
            </div>
          )}

          {/* Approved */}
          {state === 'APPROVED' && receipt && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
                <span className="font-bold text-sm">Pago aprobado</span>
              </div>
              <div className="text-xs text-emerald-900 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Transacción:</span>
                  <span className="font-bold">{receipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span className="font-bold">{receipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Referencia:</span>
                  <span className="font-bold">****{receipt.last4}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-bold">{new Date(receipt.paidAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form (visible while not processing / approved) */}
          {(state === 'IDLE' || state === 'REJECTED') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Method selector */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">Método de Pago</span>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${method === m.id
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={m.id}
                        checked={method === m.id}
                        onChange={() => setMethod(m.id)}
                        className="accent-indigo-600"
                      />
                      <span className="material-symbols-outlined text-[20px] text-slate-600">{m.icon}</span>
                      <span className="flex-1">
                        <span className="block text-xs font-semibold text-slate-800">{m.label}</span>
                        <span className="block text-[10px] text-slate-500">{m.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card fields */}
              {method === 'CARD' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Datos de la Tarjeta</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCard(TEST_CARD);
                        setErrors({});
                        if (state === 'REJECTED') setState('IDLE');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <span className="material-symbols-outlined text-[15px]">autorenew</span>
                      Usar tarjeta de prueba
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Titular</label>
                    <input
                      type="text"
                      value={card.holder}
                      onChange={(e) => setCard({ ...card, holder: e.target.value })}
                      placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-2 focus:ring-indigo-200 ${errors.holder ? 'border-rose-300' : 'border-slate-300'
                        }`}
                    />
                    {errors.holder && <p className="text-[10px] text-rose-600 mt-1">{errors.holder}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                      placeholder="4242 4242 4242 4242"
                      className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-indigo-200 ${errors.number ? 'border-rose-300' : 'border-slate-300'
                        }`}
                    />
                    {errors.number && <p className="text-[10px] text-rose-600 mt-1">{errors.number}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Expiración</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/AA"
                        className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-indigo-200 ${errors.expiry ? 'border-rose-300' : 'border-slate-300'
                          }`}
                      />
                      {errors.expiry && <p className="text-[10px] text-rose-600 mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">CVV</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-indigo-200 ${errors.cvv ? 'border-rose-300' : 'border-slate-300'
                          }`}
                      />
                      {errors.cvv && <p className="text-[10px] text-rose-600 mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Entorno de simulación. No se procesan datos ni pagos reales.
                  </p>
                </div>
              )}

              {/* Rejected banner */}
              {state === 'REJECTED' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  El pago fue rechazado. Revisa los datos e intenta de nuevo.
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Pagar ${reservation.totalAmount.toFixed(2)}
              </button>
            </form>
          )}

          {/* Finish button after approval */}
          {state === 'APPROVED' && receipt && (
            <button
              onClick={handleFinish}
              className="w-full px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDrawer;
