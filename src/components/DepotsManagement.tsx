import React, { useState } from 'react';
import { Depot, Asset, HospitalityRoom, UserSession, Reservation } from '../types';

interface DepotsManagementProps {
  session: UserSession;
  depots: Depot[];
  rooms: HospitalityRoom[];
  assets: Asset[];
  reservations: Reservation[];
  onAddDepot: (newDepot: Depot) => void;
  onUpdateDepot: (updatedDepot: Depot) => void;
  onDeleteDepot: (depotId: number) => void;
}

export const DepotsManagement: React.FC<DepotsManagementProps> = ({
  session,
  depots,
  rooms,
  assets,
  reservations,
  onAddDepot,
  onUpdateDepot,
  onDeleteDepot,
}) => {
  const isAdmin = session.role === 'ROLE_ADMIN';

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [depotToDelete, setDepotToDelete] = useState<Depot | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    city: string;
    state: string;
    address: string;
    supervisorName: string;
    supervisorPhone: string;
    operatingStatus: 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE';
    suitesCapacity: number;
  }>({
    code: '',
    name: '',
    city: '',
    state: '',
    address: '',
    supervisorName: '',
    supervisorPhone: '',
    operatingStatus: 'OPERATIONAL',
    suitesCapacity: 80,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // RBAC Access Guard: If not admin, block view
  if (!isAdmin) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-2xl mx-auto my-12 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">security</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado [HTTP 403 Forbidden]</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          El Catálogo Maestro de Centros de Despacho Logístico está restringido exclusivamente a usuarios con rol{' '}
          <code className="text-xs bg-slate-100 text-rose-700 px-2 py-1 rounded font-mono">ROLE_ADMIN</code> según
          las directivas Spring Security `@PreAuthorize`.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>Módulo Administrativo Restringido</span>
        </div>
      </div>
    );
  }

  // Pre-calculated Global Metrics
  const totalDepots = depots.length;
  const totalSuitesCap = depots.reduce((sum, d) => sum + d.suitesCapacity, 0);
  const operationalDepots = depots.filter((d) => (d.operatingStatus || 'OPERATIONAL') === 'OPERATIONAL').length;

  // Filtered Depots
  const filteredDepots = depots.filter((depot) => {
    const matchesSearch =
      depot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      depot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      depot.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      depot.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (depot.supervisorName && depot.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = depot.operatingStatus || 'OPERATIONAL';
    const matchesStatus = filterStatus === 'ALL' || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingDepot(null);
    setFormData({
      code: 'HUB-' + Math.floor(10 + Math.random() * 89),
      name: 'Nuevo Centro Logístico & Despacho',
      city: 'Miami',
      state: 'FL',
      address: 'Industrial Gateway Blvd #400',
      supervisorName: 'Ing. Carlos Mendoza (Coordinador de Patio)',
      supervisorPhone: '+1 (305) 555-0199',
      operatingStatus: 'OPERATIONAL',
      suitesCapacity: 90,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (depot: Depot) => {
    setEditingDepot(depot);
    setFormData({
      code: depot.code,
      name: depot.name,
      city: depot.city,
      state: depot.state,
      address: depot.address || '',
      supervisorName: depot.supervisorName || '',
      supervisorPhone: depot.supervisorPhone || '',
      operatingStatus: depot.operatingStatus || 'OPERATIONAL',
      suitesCapacity: depot.suitesCapacity,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Depot (Create / Update)
  const handleSaveDepot = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim() || !formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
      setFormError('Código, Nombre, Ciudad y Estado son campos obligatorios.');
      return;
    }

    if (formData.suitesCapacity <= 0) {
      setFormError('La capacidad de suites debe ser un número entero mayor a 0.');
      return;
    }

    if (editingDepot) {
      // Update
      const updated: Depot = {
        ...editingDepot,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        address: formData.address.trim(),
        supervisorName: formData.supervisorName.trim(),
        supervisorPhone: formData.supervisorPhone.trim(),
        operatingStatus: formData.operatingStatus,
        suitesCapacity: Number(formData.suitesCapacity),
      };
      onUpdateDepot(updated);
      showNotification(`Centro de Despacho "${updated.code} - ${updated.name}" actualizado.`);
    } else {
      // Check code uniqueness
      const exists = depots.some((d) => d.code.toUpperCase() === formData.code.trim().toUpperCase());
      if (exists) {
        setFormError(`El código de centro "${formData.code.toUpperCase()}" ya existe en la red.`);
        return;
      }

      const newDepot: Depot = {
        id: Date.now(),
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        address: formData.address.trim(),
        supervisorName: formData.supervisorName.trim(),
        supervisorPhone: formData.supervisorPhone.trim(),
        operatingStatus: formData.operatingStatus,
        suitesCapacity: Number(formData.suitesCapacity),
        suitesActive: 0,
        activeUtilizationRate: 0.0,
      };
      onAddDepot(newDepot);
      showNotification(`Centro de Despacho "${newDepot.code}" registrado satisfactoriamente.`);
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!depotToDelete) return;

    // Check if there are rooms associated
    const associatedRooms = rooms.filter((r) => r.depotId === depotToDelete.id || r.depotCode === depotToDelete.code);

    if (associatedRooms.length > 0) {
      if (
        !confirm(
          `Advertencia de Integridad Referencial:\nEl centro "${depotToDelete.code}" tiene ${associatedRooms.length} habitaciones asociadas.\n¿Desea forzar la eliminación administrativa de todos modos?`
        )
      ) {
        return;
      }
    }

    onDeleteDepot(depotToDelete.id);
    showNotification(`Centro de Despacho "${depotToDelete.code}" eliminado de la red logística.`);
    setDepotToDelete(null);
  };

  const getStatusBadge = (status: 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE' = 'OPERATIONAL') => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            OPERATIVO 24/7
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            CAPACIDAD LIMITADA
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-[13px]">construction</span>
            MANTENIMIENTO DE PATIO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold">
                <span className="material-symbols-outlined text-[20px]">warehouse</span>
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Gestión de Centros de Despacho y Patios Logísticos
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200">
                CRUD ADMIN EXCLUSIVO
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Administración de centros de hospitalidad, capacidad de suites, supervisor a cargo y monitoreo de ocupación en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nuevo Centro de Despacho</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Centros Totales</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalDepots}</span>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">{operationalDepots} 100% operativos</span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-[11px] font-medium text-indigo-700 uppercase tracking-wider block">Centros Operativos</span>
            <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">{operationalDepots}</span>
            <span className="text-[10px] text-indigo-600 mt-0.5 block">Sincronizados 24/7</span>
          </div>

          <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100">
            <span className="text-[11px] font-medium text-cyan-700 uppercase tracking-wider block">Supervisores</span>
            <span className="text-2xl font-extrabold text-cyan-700 mt-1 block">{totalDepots}</span>
            <span className="text-[10px] text-cyan-600 mt-0.5 block">Uno por centro</span>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <span className="text-[11px] font-medium text-purple-700 uppercase tracking-wider block">Capacidad Suites</span>
            <span className="text-2xl font-extrabold text-purple-700 mt-1 block">{totalSuitesCap}</span>
            <span className="text-[10px] text-purple-600 mt-0.5 block">Habitaciones y descanso</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por código, ciudad, supervisor..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="OPERATIONAL">Operativo 24/7</option>
            <option value="LIMITED">Capacidad Limitada</option>
            <option value="MAINTENANCE">Mantenimiento de Patio</option>
          </select>
        </div>
      </div>

      {/* DEPOTS LISTING (CARDS WITH CAPACITY GAUGES) */}
      {filteredDepots.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px]">domain_disabled</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No se encontraron centros de despacho</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No existen terminales que coincidan con la búsqueda o el filtro aplicado.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('ALL');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredDepots.map((depot) => {
            const depotRooms = rooms.filter((r) => r.depotId === depot.id || r.depotCode === depot.code);

            return (
              <div
                key={depot.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                        {depot.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {depot.city}, {depot.state}
                      </span>
                    </div>
                    {getStatusBadge(depot.operatingStatus)}
                  </div>

                  {/* Name and Address */}
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{depot.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 mb-4">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                    <span>{depot.address || 'Corredor de Hospitalidad / Centro de Suites'}</span>
                  </p>

                  {/* Supervisor Card */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {depot.supervisorName ? depot.supervisorName.charAt(0) : 'S'}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">SUPERVISOR DE PATIO</span>
                        <span className="font-semibold text-slate-800">
                          {depot.supervisorName || 'Personal de Turno Central'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">LÍNEA OPERATIVA</span>
                      <span className="font-mono text-[11px] text-indigo-600 font-semibold">
                        {depot.supervisorPhone || '+1 (800) 555-DESP'}
                      </span>
                    </div>
                  </div>

                  {/* CAPACITY ALLOCATION GAUGES */}
                  <div className="space-y-3 mb-5">
                    {/* Suites */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-purple-600">hotel</span>
                          Hospitality Suites & Descanso
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          <strong className="text-slate-900">{depot.suitesActive}</strong> / {depot.suitesCapacity}{' '}
                          habitaciones
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.round((depot.suitesActive / depot.suitesCapacity) * 100))}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Inventory Summary */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 py-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">bed</span>
                      {depotRooms.length} habitaciones en inventario
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Utilización de suites: <strong className="text-slate-700">{depot.activeUtilizationRate}%</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(depot)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => setDepotToDelete(depot)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT DEPOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">warehouse</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingDepot ? 'Editar Centro de Despacho' : 'Registrar Nuevo Centro Logístico'}
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Configuración de Nodo Terminal - ROLE_ADMIN Exclusivo
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

            <form onSubmit={handleSaveDepot} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Centro (IATA / ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: MIA-03"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Centro / Terminal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Miami Gateway Logistics Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Miami"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado / Región *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: FL"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección Física / Corredor
                  </label>
                  <input
                    type="text"
                    placeholder="ej: 10400 W Higgins Rd, Logistics Corridor"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Supervisor Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supervisor / Coordinador de Patio
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Ing. Marcus Vance"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* Supervisor Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono Operativo
                  </label>
                  <input
                    type="text"
                    placeholder="ej: +1 (305) 555-0199"
                    value={formData.supervisorPhone}
                    onChange={(e) => setFormData({ ...formData, supervisorPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Operating Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={formData.operatingStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatingStatus: e.target.value as 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="OPERATIONAL">OPERATIVO 24/7</option>
                    <option value="LIMITED">CAPACIDAD LIMITADA</option>
                    <option value="MAINTENANCE">MANTENIMIENTO DE PATIO</option>
                  </select>
                </div>

                {/* Suites Capacity */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacidad Habitaciones / Suites (Unidades) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="400"
                    value={formData.suitesCapacity}
                    onChange={(e) => setFormData({ ...formData, suitesCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
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
                  {editingDepot ? 'Guardar Cambios' : 'Registrar Centro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {depotToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">¿Eliminar Centro de Despacho?</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Estás a punto de desmantelar el centro{' '}
              <span className="font-mono font-bold text-slate-800">{depotToDelete.code}</span> ({depotToDelete.name}
              ).
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDepotToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
