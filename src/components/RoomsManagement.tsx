import React, { useState } from 'react';
import { HospitalityRoom, Depot, UserSession, RoomStatus, RoomCategory, Reservation } from '../types';

interface RoomsManagementProps {
  session: UserSession;
  rooms: HospitalityRoom[];
  depots: Depot[];
  reservations: Reservation[];
  onAddRoom: (newRoom: HospitalityRoom) => void;
  onUpdateRoom: (updatedRoom: HospitalityRoom) => void;
  onDeleteRoom: (roomId: number) => void;
  onFastStatusChange: (roomId: number, newStatus: RoomStatus) => void;
}

export const RoomsManagement: React.FC<RoomsManagementProps> = ({
  session,
  rooms,
  depots,
  reservations,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onFastStatusChange,
}) => {
  const isAdmin = session.role === 'ROLE_ADMIN';

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepot, setFilterDepot] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HospitalityRoom | null>(null);

  // Delete confirmation modal state
  const [roomToDelete, setRoomToDelete] = useState<HospitalityRoom | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    roomNumber: string;
    name: string;
    category: RoomCategory;
    depotId: number;
    capacityPersons: number;
    baseHourlyRate: number;
    pricePerNight: number;
    status: RoomStatus;
    iotLockId: string;
    floor: number;
    amenities: string[];
    cleanlinessScore: number;
    notes: string;
  }>({
    roomNumber: '',
    name: '',
    category: 'EXECUTIVE_SUITE',
    depotId: depots[0]?.id || 1,
    capacityPersons: 2,
    baseHourlyRate: 75,
    pricePerNight: 280,
    status: 'AVAILABLE',
    iotLockId: 'LOCK-IOT-' + Math.floor(1000 + Math.random() * 9000),
    floor: 2,
    amenities: ['Cerradura Inteligente IoT', 'Climatización Smart', 'Wi-Fi 6E Satelital'],
    cleanlinessScore: 98,
    notes: 'Habitación inspeccionada y certificada con protocolo de hospitalidad ejecutiva.',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // RBAC Access Guard: If not admin, block view
  if (!isAdmin) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-2xl mx-auto my-12 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">gpp_bad</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado [HTTP 403 Forbidden]</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Esta vista administrativa está protegida por políticas estrictas de seguridad Spring Security:{' '}
          <code className="text-xs bg-slate-100 text-rose-700 px-2 py-1 rounded font-mono">
            @PreAuthorize("hasRole('ADMIN')")
          </code>
          . Tu usuario actual posee el rol <span className="font-semibold text-slate-900">{session.role}</span>.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>Módulo restringido a Administradores del Sistema</span>
        </div>
      </div>
    );
  }

  // Pre-calculated Metrics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const sanitizingRooms = rooms.filter((r) => r.status === 'CLEANING_DISINFECTION').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const avgHourlyRate = totalRooms > 0 ? (rooms.reduce((acc, r) => acc + r.baseHourlyRate, 0) / totalRooms).toFixed(2) : '0.00';

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.depotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.iotLockId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepot = filterDepot === 'ALL' || room.depotCode === filterDepot;
    const matchesCategory = filterCategory === 'ALL' || room.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || room.status === filterStatus;

    return matchesSearch && matchesDepot && matchesCategory && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    const defaultDepot = depots[0] || { id: 1, code: 'ORD-01' };
    setFormData({
      roomNumber: `ROOM-${defaultDepot.code.split('-')[0]}-${Math.floor(10 + Math.random() * 89)}${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}`,
      name: 'Nueva Suite Ejecutiva Terminal',
      category: 'EXECUTIVE_SUITE',
      depotId: defaultDepot.id,
      capacityPersons: 2,
      baseHourlyRate: 85,
      pricePerNight: 320,
      status: 'AVAILABLE',
      iotLockId: 'LOCK-IOT-' + Math.floor(1000 + Math.random() * 9000),
      floor: 2,
      amenities: ['Cerradura Inteligente IoT', 'Climatización Smart', 'Wi-Fi 6E Satelital', 'Insonorización 45dB'],
      cleanlinessScore: 100,
      notes: 'Alta en inventario por ROLE_ADMIN. Lista para protocolo de despacho.',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (room: HospitalityRoom) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      name: room.name,
      category: room.category,
      depotId: room.depotId,
      capacityPersons: room.capacityPersons,
      baseHourlyRate: room.baseHourlyRate,
      pricePerNight: room.pricePerNight,
      status: room.status,
      iotLockId: room.iotLockId,
      floor: room.floor,
      amenities: [...room.amenities],
      cleanlinessScore: room.cleanlinessScore,
      notes: room.notes,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Toggle Amenity Checkbox
  const handleToggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  // Save Room (Create or Update)
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.roomNumber.trim() || !formData.name.trim()) {
      setFormError('El código identificador y el nombre de la habitación son obligatorios.');
      return;
    }

    const selectedDepot = depots.find((d) => d.id === Number(formData.depotId));
    if (!selectedDepot) {
      setFormError('El centro de despacho seleccionado no es válido.');
      return;
    }

    if (formData.baseHourlyRate <= 0 || formData.pricePerNight <= 0) {
      setFormError('Las tarifas base deben ser números positivos mayores a 0.');
      return;
    }

    if (editingRoom) {
      // Update existing
      const updated: HospitalityRoom = {
        ...editingRoom,
        roomNumber: formData.roomNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        depotId: selectedDepot.id,
        depotCode: selectedDepot.code,
        capacityPersons: Number(formData.capacityPersons),
        baseHourlyRate: Number(formData.baseHourlyRate),
        pricePerNight: Number(formData.pricePerNight),
        status: formData.status,
        iotLockId: formData.iotLockId.trim().toUpperCase(),
        floor: Number(formData.floor),
        amenities: formData.amenities,
        cleanlinessScore: Number(formData.cleanlinessScore),
        notes: formData.notes.trim(),
        lastSanitizedAt: formData.status === 'AVAILABLE' ? new Date().toISOString() : editingRoom.lastSanitizedAt,
      };
      onUpdateRoom(updated);
      showNotification(`Habitación "${updated.roomNumber}" actualizada con éxito.`);
    } else {
      // Create new
      const exists = rooms.some(
        (r) => r.roomNumber.toUpperCase() === formData.roomNumber.trim().toUpperCase()
      );
      if (exists) {
        setFormError(`El código "${formData.roomNumber.toUpperCase()}" ya se encuentra registrado.`);
        return;
      }

      const newRoom: HospitalityRoom = {
        id: Date.now(),
        roomNumber: formData.roomNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        depotId: selectedDepot.id,
        depotCode: selectedDepot.code,
        capacityPersons: Number(formData.capacityPersons),
        baseHourlyRate: Number(formData.baseHourlyRate),
        pricePerNight: Number(formData.pricePerNight),
        status: formData.status,
        iotLockId: formData.iotLockId.trim().toUpperCase(),
        floor: Number(formData.floor),
        amenities: formData.amenities,
        cleanlinessScore: Number(formData.cleanlinessScore),
        notes: formData.notes.trim(),
        lastSanitizedAt: new Date().toISOString(),
      };
      onAddRoom(newRoom);
      showNotification(`Habitación "${newRoom.roomNumber}" dada de alta correctamente.`);
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!roomToDelete) return;
    onDeleteRoom(roomToDelete.id);
    showNotification(`Habitación "${roomToDelete.roomNumber}" eliminada del inventario maestro.`);
    setRoomToDelete(null);
  };

  // Helper labels and badges
  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            DISPONIBLE
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            OCUPADA
          </span>
        );
      case 'CLEANING_DISINFECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">sanitizer</span>
            HIGIENIZACIÓN (35m)
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-[13px]">handyman</span>
            MANTENIMIENTO
          </span>
        );
    }
  };

  const getCategoryLabel = (category: RoomCategory) => {
    switch (category) {
      case 'EXECUTIVE_SUITE':
        return 'Suite Ejecutiva VIP';
      case 'CREW_REST_CABIN':
        return 'Cabina Descanso Tripulación';
      case 'STANDARD_ROOM':
        return 'Habitación Estándar';
      case 'LONG_HAUL_VIP':
        return 'Suite Presidencial Larga Distancia';
    }
  };

  const getCategoryIcon = (category: RoomCategory) => {
    switch (category) {
      case 'EXECUTIVE_SUITE':
        return 'hotel_class';
      case 'CREW_REST_CABIN':
        return 'airline_seat_individual_suite';
      case 'STANDARD_ROOM':
        return 'bed';
      case 'LONG_HAUL_VIP':
        return 'crown';
    }
  };

  const ALL_AMENITIES = [
    'Cerradura Inteligente IoT',
    'Climatización Smart',
    'Insonorización 45dB',
    'Wi-Fi 6E Satelital',
    'Ducha de Alta Presión',
    'Minibar Ejecutivo',
    'Cama Ortopédica King',
    'Blackout Total 100%',
    'Control de Ruido Blanco',
    'Sala de Juntas Privada',
    'Jacuzzi Hidromasaje',
    'Smart TV 65"',
    'Cafetera Espresso Nespresso',
    'Escritorio Ergonómico Herman Miller',
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          <span className="text-xs font-medium">{successToast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold">
                <span className="material-symbols-outlined text-[20px]">hotel</span>
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Gestión de Habitaciones y Suites de Descanso
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200">
                CRUD ADMIN EXCLUSIVO
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Administración de inventario hotelero corporativo, cerraduras inteligentes IoT, protocolos de higienización de 35 min y asignación de depósitos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nueva Habitación / Suite</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Suites</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalRooms}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Inventario de Red</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider block">Disponibles</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{availableRooms}</span>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">Listas para reservar</span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider block">Ocupadas</span>
            <span className="text-2xl font-extrabold text-blue-700 mt-1 block">{occupiedRooms}</span>
            <span className="text-[10px] text-blue-600 mt-0.5 block">Huéspedes activos</span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider block">Higienización</span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{sanitizingRooms}</span>
            <span className="text-[10px] text-amber-600 mt-0.5 block">Protocolo 35 min</span>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-purple-700 uppercase tracking-wider block">Tarifa Promedio</span>
            <span className="text-2xl font-extrabold text-purple-700 mt-1 block">${avgHourlyRate}/h</span>
            <span className="text-[10px] text-purple-600 mt-0.5 block">{maintenanceRooms} en mantenimiento</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código, nombre, IoT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Depot Filter */}
          <select
            value={filterDepot}
            onChange={(e) => setFilterDepot(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Todos los Centros</option>
            {depots.map((d) => (
              <option key={d.id} value={d.code}>
                {d.code} - {d.city}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="EXECUTIVE_SUITE">Suite Ejecutiva VIP</option>
            <option value="CREW_REST_CABIN">Cabina Descanso Tripulación</option>
            <option value="STANDARD_ROOM">Habitación Estándar</option>
            <option value="LONG_HAUL_VIP">Suite Larga Distancia</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="OCCUPIED">Ocupada</option>
            <option value="CLEANING_DISINFECTION">Higienización (35m)</option>
            <option value="MAINTENANCE">Mantenimiento</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode('cards')}
              title="Vista en Tarjetas"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Vista en Tabla"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: CARDS VIEW OR TABLE VIEW */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No se encontraron habitaciones</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No hay habitaciones que coincidan con los filtros seleccionados o el término de búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDepot('ALL');
              setFilterCategory('ALL');
              setFilterStatus('ALL');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code + Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {room.roomNumber}
                    </span>
                    {getStatusBadge(room.status)}
                  </div>

                  {/* Room Name & Category */}
                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">{room.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">
                      {getCategoryIcon(room.category)}
                    </span>
                    <span>{getCategoryLabel(room.category)}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">Piso {room.floor}</span>
                  </div>

                  {/* Depot & IoT Lock */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Centro Despacho</span>
                      <span className="font-semibold text-slate-800">{room.depotCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Cerradura IoT</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700">{room.iotLockId}</span>
                    </div>
                  </div>

                  {/* Rates and Capacity */}
                  <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tarifa por Hora</span>
                      <span className="font-extrabold text-slate-900 text-sm">${room.baseHourlyRate.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Por Noche</span>
                      <span className="font-semibold text-slate-700">${room.pricePerNight.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Capacidad</span>
                      <span className="font-semibold text-slate-700">{room.capacityPersons} pers.</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bioseguridad</span>
                      <span className="font-bold text-emerald-600">{room.cleanlinessScore}%</span>
                    </div>
                  </div>

                  {/* Amenities Chips */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Notes / Sanitized */}
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic mb-4">"{room.notes}"</p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Fast Status Change */}
                  {room.status === 'CLEANING_DISINFECTION' ? (
                    <button
                      onClick={() => onFastStatusChange(room.id, 'AVAILABLE')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Certificar Protocolo 35m y Marcar Disponible"
                    >
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>Liberar Suite</span>
                    </button>
                  ) : room.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => onFastStatusChange(room.id, 'CLEANING_DISINFECTION')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Iniciar Ciclo de Higienización de 35 min"
                    >
                      <span className="material-symbols-outlined text-[15px]">sanitizer</span>
                      <span>Higienizar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onFastStatusChange(room.id, 'AVAILABLE')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Disponible</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleOpenEditModal(room)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                      title="Editar Habitación"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => setRoomToDelete(room)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                      title="Eliminar Habitación"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Código / Nombre</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Centro</th>
                  <th className="py-3 px-4">Capacidad</th>
                  <th className="py-3 px-4">Tarifa / Hora</th>
                  <th className="py-3 px-4">Por Noche</th>
                  <th className="py-3 px-4">Cerradura IoT</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-indigo-600">{room.roomNumber}</span>
                        <span className="text-slate-900 font-bold">{room.name}</span>
                        <span className="text-[10px] text-slate-400">Piso {room.floor}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          {getCategoryIcon(room.category)}
                        </span>
                        <span>{getCategoryLabel(room.category)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{room.depotCode}</td>
                    <td className="py-3 px-4">{room.capacityPersons} personas</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">${room.baseHourlyRate.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-600">${room.pricePerNight.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{room.iotLockId}</td>
                    <td className="py-3 px-4">{getStatusBadge(room.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(room)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => setRoomToDelete(room)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROOM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">hotel</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingRoom ? 'Editar Habitación / Suite' : 'Dar de Alta Nueva Habitación'}
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Módulo de Inventario de Hospitalidad - Spring Security ROLE_ADMIN
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Habitación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: ROOM-ORD-15C"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Descriptivo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Suite Ejecutiva Highland 15C"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                {/* Depot Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Centro de Despacho Asignado *
                  </label>
                  <select
                    value={formData.depotId}
                    onChange={(e) => setFormData({ ...formData, depotId: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name} ({d.city}, {d.state})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría de Suite *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as RoomCategory })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="EXECUTIVE_SUITE">Suite Ejecutiva VIP</option>
                    <option value="CREW_REST_CABIN">Cabina Descanso Tripulación</option>
                    <option value="STANDARD_ROOM">Habitación Estándar</option>
                    <option value="LONG_HAUL_VIP">Suite Presidencial Larga Distancia</option>
                  </select>
                </div>

                {/* Capacity Persons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacidad (Personas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.capacityPersons}
                    onChange={(e) => setFormData({ ...formData, capacityPersons: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Piso / Nivel de Terminal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarifa Base por Hora ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={formData.baseHourlyRate}
                    onChange={(e) => setFormData({ ...formData, baseHourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* Price Per Night */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarifa por Noche ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* IoT Lock Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cerradura Electrónica IoT
                  </label>
                  <input
                    type="text"
                    value={formData.iotLockId}
                    onChange={(e) => setFormData({ ...formData, iotLockId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Operativo Inicial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="AVAILABLE">DISPONIBLE</option>
                    <option value="OCCUPIED">OCUPADA</option>
                    <option value="CLEANING_DISINFECTION">HIGIENIZACIÓN (35m)</option>
                    <option value="MAINTENANCE">MANTENIMIENTO</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amenidades y Equipamiento de Suite
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 max-h-36 overflow-y-auto">
                  {ALL_AMENITIES.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Inspección y Registro
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observaciones de limpieza, bioseguridad, inventario..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">¿Eliminar Habitación?</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Estás a punto de dar de baja la habitación{' '}
              <span className="font-mono font-bold text-slate-800">{roomToDelete.roomNumber}</span> (
              {roomToDelete.name}) del centro <span className="font-semibold">{roomToDelete.depotCode}</span>. Esta
              acción no se puede revertir.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setRoomToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
