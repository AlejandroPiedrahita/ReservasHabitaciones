import React, { useState, useEffect } from 'react';
import { Asset, Depot, HospitalityRoom, Reservation } from '../types';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  rooms: HospitalityRoom[];
  depots: Depot[];
  reservations: Reservation[];
  onReservationCreated: (newRes: Reservation) => void;
  currentUserEmail: string;
  initialItemId?: number | null;
  initialCategory?: 'ROOM';
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  assets,
  rooms = [],
  depots,
  reservations,
  onReservationCreated,
  currentUserEmail,
  initialItemId = null,
  initialCategory = 'ROOM',
}) => {
  // Room Mode State
  const [selectedRoomId, setSelectedRoomId] = useState<number>(
    initialItemId ? initialItemId : rooms[0]?.id || 1
  );

  // Synchronize when initial props change
  useEffect(() => {
    if (initialItemId) {
      setSelectedRoomId(initialItemId);
    }
  }, [initialItemId, initialCategory, isOpen]);

  // Common Reservation Fields
  const [selectedDepotId, setSelectedDepotId] = useState<number>(depots[0]?.id || 1);
  const [customerName, setCustomerName] = useState('Apex Logistics Global');
  const [startTime, setStartTime] = useState('2026-09-24T08:00');
  const [endTime, setEndTime] = useState('2026-09-24T18:00');
  const [destinationOrRoom, setDestinationOrRoom] = useState('');
  const [manifestNotes, setManifestNotes] = useState('');
  const [assignedConcierge, setAssignedConcierge] = useState('');

  const [collisionError, setCollisionError] = useState<string | null>(null);

  // Auto-sync room info when selectedRoomId changes
  useEffect(() => {
    const room = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
    if (room) {
      setSelectedDepotId(room.depotId);
      setDestinationOrRoom(`Suite ${room.roomNumber} - ${room.name} (Piso ${room.floor})`);
      setAssignedConcierge(`Conserjería Central / Cerradura ${room.iotLockId}`);
      setManifestNotes(`Reserva de Suite para Tripulación/Ejecutivo. Protocolo de higienización de 35 min garantizado.`);
    }
  }, [selectedRoomId, rooms]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const selectedDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCollisionError(null);

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (end <= start) {
      setCollisionError('Error de Validación: La hora de finalización debe ser estrictamente posterior a la hora de inicio.');
      return;
    }

    // 35-minute turnaround/sanitization buffer (35 * 60 * 1000)
    const BUFFER_MS = 35 * 60 * 1000;
    const bufferedStart = start - BUFFER_MS;
    const bufferedEnd = end + BUFFER_MS;

    // Determine target identifier and hourly rate
    const targetIdentifier = currentRoom.roomNumber;
    const targetName = currentRoom.name;
    const targetId = currentRoom.id;
    const baseRate = currentRoom.baseHourlyRate;

    // Check for collisions against existing active reservations
    const conflict = reservations.find((r) => {
      if (r.status === 'CANCELLED' || r.status === 'COMPLETED') return false;

      // Check collision by exact room code match
      const sameAsset =
        r.assetIdentifier === targetIdentifier ||
        r.assetId === targetId ||
        r.destinationOrRoom.includes(targetIdentifier);

      if (!sameAsset) return false;

      const rStart = new Date(r.startTime).getTime();
      const rEnd = new Date(r.endTime).getTime();

      // Overlap condition: candidateStart < existingEnd && candidateEnd > existingStart
      return bufferedStart < rEnd && bufferedEnd > rStart;
    });

    if (conflict) {
      setCollisionError(
        `HTTP 409 Conflicto [SOLAPAMIENTO_DETECTADO]: La suite [${targetIdentifier} - ${targetName}] ya está reservada por "${conflict.customerName}" desde las ${new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hasta las ${new Date(conflict.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${conflict.reservationCode}). El sistema protege el margen obligatorio de 35 min de higienización.`
      );
      return;
    }

    // Calculate rates
    const durationHours = Math.max(1, Math.round((end - start) / (3600 * 1000)));
    const baseCost = +(baseRate * durationHours).toFixed(2);
    const serviceFee = 25.0; // Tarifa de higienización
    const insuranceFee = 30.0; // Seguro de estancia
    const totalAmount = +(baseCost + serviceFee + insuranceFee).toFixed(2);

    const finalDestinationOrRoom = `Suite ${currentRoom.roomNumber} - ${currentRoom.name} (Piso ${currentRoom.floor})`;

    const newRes: Reservation = {
      id: Date.now(),
      reservationCode: `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      assetId: targetId,
      assetIdentifier: targetIdentifier,
      assetName: targetName,
      depotId: selectedDepot.id,
      depotCode: selectedDepot.code,
      userId: 1,
      userEmail: currentUserEmail,
      customerName,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status: 'PENDING',
      baseCost,
      serviceFee,
      insuranceFee,
      totalAmount,
      destinationOrRoom: finalDestinationOrRoom,
      manifestNotes: `${manifestNotes} [Cerradura IoT: ${currentRoom.iotLockId}] [Bioseguridad: ${currentRoom.cleanlinessScore}%]`,
      assignedConcierge,
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onReservationCreated(newRes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">hotel</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reservar Habitación o Suite de Hospitalidad
              </h3>
              <p className="text-xs text-slate-500">
                Verificación de colisiones en tiempo real y protocolo de higienización de 35 min
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Collision Warning Banner */}
        {collisionError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
            <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">error</span>
            <div>
              <div className="font-bold">Solapamiento de Reserva Detectado</div>
              <div className="mt-0.5 leading-relaxed">{collisionError}</div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* SELECTOR DE HABITACIONES DEDICADO */}
          <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Seleccionar Habitación o Suite del Catálogo Maestro *</span>
                  <span className="text-[11px] text-indigo-600 font-normal">
                    {rooms.length} suites registradas
                  </span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                  className="w-full text-xs py-2.5 px-3 border border-indigo-300 rounded-lg bg-indigo-50/30 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.depotCode}] {r.roomNumber} — {r.name} (${r.baseHourlyRate}/h | ${r.pricePerNight}/noche) — Piso {r.floor} ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Detailed Preview Card */}
              {currentRoom && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{currentRoom.name}</span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-indigo-700">
                          {currentRoom.roomNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Centro: <span className="font-semibold text-slate-700">{currentRoom.depotCode}</span> • Piso: <span className="font-semibold text-slate-700">{currentRoom.floor}</span> • Capacidad: <span className="font-semibold text-slate-700">{currentRoom.capacityPersons} personas</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900 font-mono">
                        ${currentRoom.baseHourlyRate}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/ hora base</span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        currentRoom.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentRoom.status === 'CLEANING_DISINFECTION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      ESTADO: {currentRoom.status}
                    </span>
                    <span className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[14px] text-indigo-600">lock</span>
                      Cerradura IoT: {currentRoom.iotLockId}
                    </span>
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-mono ml-auto">
                      <span className="material-symbols-outlined text-[14px]">sanitizer</span>
                      Higiene: {currentRoom.cleanlinessScore}%
                    </span>
                  </div>

                  {/* Amenities Chips */}
                  {currentRoom.amenities && currentRoom.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {currentRoom.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600"
                        >
                          ✓ {amenity}
                        </span>
                      ))}
                      {currentRoom.amenities.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{currentRoom.amenities.length - 4} más
                        </span>
                      )}
                    </div>
                  )}

                  {currentRoom.status !== 'AVAILABLE' && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">info</span>
                      <span>
                        Atención: Esta habitación se encuentra en estado <strong>{currentRoom.status}</strong>. Si programa la reserva para un horario posterior al ciclo de higienización de 35 min, el sistema autorizará la reserva.
                      </span>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Centro de Despacho & Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Depot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Centro de Despacho Logístico / Terminal
              </label>
              <select
                value={selectedDepotId}
                onChange={(e) => setSelectedDepotId(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                {depots.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name} ({d.city}, {d.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer / Corporate Entity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente Corporativo / Cuenta
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                placeholder="ej. Apex Enterprises, Marriott Corporate, Acme Suites"
              />
            </div>
          </div>

          {/* Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora de Inicio (UTC)
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora de Finalización (UTC)
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Destination / Room & Concierge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suite / Habitación Confirmada
              </label>
              <input
                type="text"
                required
                value={destinationOrRoom}
                onChange={(e) => setDestinationOrRoom(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                placeholder="Suite 14B - Piso 3"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Conserje / Llave Digital Asignada
              </label>
              <input
                type="text"
                value={assignedConcierge}
                onChange={(e) => setAssignedConcierge(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                placeholder="Operador o código de cerradura inteligente"
              />
            </div>
          </div>

          {/* Manifest Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas del Manifiesto y Directivas SLA
            </label>
            <textarea
              rows={2}
              value={manifestNotes}
              onChange={(e) => setManifestNotes(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              placeholder="Instrucciones especiales, código de acceso IoT..."
            />
          </div>

          {/* Pricing Policy Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Tarifa Base Calculada:</span>
              <span className="font-mono font-bold text-slate-800">
                ${currentRoom.baseHourlyRate}/hora
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Recargos y Coberturas:</span>
              <span className="font-mono">
                $25.00 Higienización Biosegura, $30.00 Seguro Estancia VIP
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Margen de Rotación e Higiene:</span>
              <span className="font-mono text-emerald-600 font-semibold">
                35 min de margen preventivo garantizado
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Confirmar Reserva de Habitación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
