import React, { useState } from 'react';
import { Asset, Depot, HospitalityRoom, Reservation, PaymentReceipt, Role, RoomStatus, SystemSettings, TelemetryAlert, UserSession, UserProfile } from './types';
import {
  INITIAL_ALERTS,
  INITIAL_ASSETS,
  INITIAL_DEPOTS,
  INITIAL_RESERVATIONS,
  INITIAL_ROOMS,
  INITIAL_SETTINGS,
} from './data/mockData';
import { LoginPortal } from './components/LoginPortal';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { EnterpriseSettings } from './components/EnterpriseSettings';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { SwaggerExplorer } from './components/SwaggerExplorer';
import { QaTestRunner } from './components/QaTestRunner';
import { NewReservationModal } from './components/NewReservationModal';
import { ReservationDetailDrawer } from './components/ReservationDetailDrawer';
import { RoomsManagement } from './components/RoomsManagement';
import { DepotsManagement } from './components/DepotsManagement';
import { BookingCarousel } from './components/BookingCarousel';
import { ClientReservations } from './components/ClientReservations';
import { UserProfileModal } from './components/UserProfileModal';

export const App: React.FC = () => {
  // Authentication session (null shows LoginPortal)
  const [session, setSession] = useState<UserSession | null>(null);

  // Active navigation view
  const [activeTab, setActiveTab] = useState<
    'overview' | 'carrusel_compra' | 'mis_reservas' | 'habitaciones' | 'centros_despacho' | 'settings' | 'how_it_works' | 'swagger' | 'qa_tests'
  >('overview');

  // Application data state
  const [depots, setDepots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [rooms, setRooms] = useState<HospitalityRoom[]>(INITIAL_ROOMS);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>(INITIAL_ALERTS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  // Modals & Drawers
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [initialBookingItem, setInitialBookingItem] = useState<{ type: 'ROOM'; id: number } | null>(null);

  // Profile State & Modals
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  // Handle Login
  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    
    // Initialize profile from session if not exists
    if (!profile) {
      setProfile({
        userId: userSession.userId,
        email: userSession.email,
        fullName: userSession.fullName,
      });
    }

    // Clients land on the purchase carousel; only admins start on the dispatch dashboard.
    setActiveTab(userSession.role === 'ROLE_ADMIN' ? 'overview' : 'carrusel_compra');
  };

  const handleLogout = () => {
    setSession(null);
  };

  const handleBookFromCarousel = (type: 'ROOM', id: number) => {
    setInitialBookingItem({ type, id });
    setIsNewModalOpen(true);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    if (session) {
      setSession({ ...session, fullName: updatedProfile.fullName });
    }
    setIsProfileModalOpen(false);
  };

  // Role Switcher with RBAC auto-redirect if demoted
  const handleSwitchRole = (newRole: Role) => {
    if (!session) return;
    setSession({
      ...session,
      role: newRole,
      fullName: newRole === 'ROLE_ADMIN' ? 'admin' : 'cliente1',
      email: newRole === 'ROLE_ADMIN' ? 'admin@admin.co' : 'cliente1@admin.co',
    });
    if (newRole !== 'ROLE_ADMIN' && (activeTab === 'habitaciones' || activeTab === 'centros_despacho')) {
      setActiveTab('overview');
    }
  };

  // Handlers for reservation lifecycle
  const handleReservationCreated = (newRes: Reservation) => {
    setReservations([newRes, ...reservations]);
  };

  // Admin approves a pending reservation -> moves it to CONFIRMED so the client can pay
  const handleApproveReservation = (id: number) => {
    if (session?.role !== 'ROLE_ADMIN') {
      alert('Acceso Denegado [HTTP 403 Prohibido]: La aprobación de reservas requiere privilegios de ROLE_ADMIN.');
      return;
    }
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'CONFIRMED', updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) => (prev ? { ...prev, status: 'CONFIRMED' } : null));
    }
  };

  // Client continues with the payment of an approved reservation
  const handlePayReservation = (id: number, payment?: PaymentReceipt) => {
    const paidAt = payment?.paidAt ?? new Date().toISOString();
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, paymentStatus: 'PAID', paidAt, paymentReceipt: payment, updatedAt: new Date().toISOString() }
          : r
      )
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) =>
        prev ? { ...prev, paymentStatus: 'PAID', paidAt, paymentReceipt: payment } : null
      );
    }
  };

  // Handlers for Rooms CRUD (Admin Only)
  const handleAddRoom = (newRoom: HospitalityRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    // Also sync to assets so reservations can book it if applicable
    const newAsset: Asset = {
      id: newRoom.id,
      assetIdentifier: newRoom.roomNumber,
      name: newRoom.name,
      type: 'HOSPITALITY_SUITE',
      depotId: newRoom.depotId,
      depotCode: newRoom.depotCode,
      baseHourlyRate: newRoom.baseHourlyRate,
      status: newRoom.status === 'AVAILABLE' ? 'ACTIVE' : 'MAINTENANCE',
      iotLockId: newRoom.iotLockId,
      cleanlinessScore: newRoom.cleanlinessScore,
      conditionReport: `Suite Piso ${newRoom.floor}. ${newRoom.notes}`,
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  const handleUpdateRoom = (updatedRoom: HospitalityRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    setAssets((prev) =>
      prev.map((a) =>
        a.assetIdentifier === updatedRoom.roomNumber || a.id === updatedRoom.id
          ? {
              ...a,
              name: updatedRoom.name,
              depotId: updatedRoom.depotId,
              depotCode: updatedRoom.depotCode,
              baseHourlyRate: updatedRoom.baseHourlyRate,
              status: updatedRoom.status === 'AVAILABLE' ? 'ACTIVE' : 'MAINTENANCE',
              iotLockId: updatedRoom.iotLockId,
              cleanlinessScore: updatedRoom.cleanlinessScore,
              conditionReport: `Suite Piso ${updatedRoom.floor}. ${updatedRoom.notes}`,
            }
          : a
      )
    );
  };

  const handleDeleteRoom = (roomId: number) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (targetRoom) {
      setAssets((prev) => prev.filter((a) => a.assetIdentifier !== targetRoom.roomNumber && a.id !== roomId));
    }
  };

  const handleFastRoomStatusChange = (roomId: number, newStatus: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: newStatus,
              lastSanitizedAt: newStatus === 'AVAILABLE' ? new Date().toISOString() : r.lastSanitizedAt,
            }
          : r
      )
    );
  };

  // Handlers for Depots CRUD (Admin Only)
  const handleAddDepot = (newDepot: Depot) => {
    setDepots((prev) => [...prev, newDepot]);
  };

  const handleUpdateDepot = (updatedDepot: Depot) => {
    setDepots((prev) => prev.map((d) => (d.id === updatedDepot.id ? updatedDepot : d)));
  };

  const handleDeleteDepot = (depotId: number) => {
    setDepots((prev) => prev.filter((d) => d.id !== depotId));
  };

  const handleFastDispatch = (id: number) => {
    if (session?.role !== 'ROLE_ADMIN') {
      alert('Acceso Denegado [HTTP 403 Prohibido]: El Despacho Rápido requiere privilegios de ROLE_ADMIN.');
      return;
    }
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'IN_TRANSIT', updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) => (prev ? { ...prev, status: 'IN_TRANSIT' } : null));
    }
  };

  const handleCompleteReservation = (id: number) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'COMPLETED', updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
    }
  };

  const handleCancelReservation = (id: number) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'CANCELLED', updatedAt: new Date().toISOString() } : r
      )
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    }
  };

  const handleDeleteReservation = (id: number) => {
    if (session?.role !== 'ROLE_ADMIN') {
      alert('Acceso Denegado [HTTP 403 Prohibido]: La purga administrativa requiere privilegios de ROLE_ADMIN.');
      return;
    }
    setReservations((prev) => prev.filter((r) => r.id !== id));
    setSelectedReservation(null);
  };

  const handleAlertAction = (alertId: string, actionName: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              resolved: true,
              resolutionNote: `Acción '${actionName}' ejecutada por ${session?.fullName}`,
            }
          : a
      )
    );
  };

  // If not logged in, render corporate LoginPortal
  if (!session) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = session.role === 'ROLE_ADMIN';

  return (
    <div className="h-full bg-[#f8f9ff] text-slate-900 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="h-16 bg-[#091426] text-white px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab(session.role === 'ROLE_ADMIN' ? 'overview' : 'carrusel_compra')}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <span className="material-symbols-outlined filled text-[20px]">deployed_code</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-none">ReserveHub</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ENTERPRISE v4.2
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block leading-tight">Operaciones de Hospitalidad</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            {isAdmin && (
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                <span>Despacho Rápido</span>
              </button>
            )}

            {/* CARRUSEL DE COMPRA Y RESERVA */}
            <button
              onClick={() => setActiveTab('carrusel_compra')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'carrusel_compra'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Carrusel de Compra y Reserva de Habitaciones y Suites"
            >
              <span className="material-symbols-outlined text-[16px]">hotel_class</span>
              <span>Carrusel de Compra</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CLIENTE
              </span>
            </button>

            {/* MIS RESERVAS (CLIENT) */}
            <button
              onClick={() => setActiveTab('mis_reservas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'mis_reservas'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title="Mis Reservas y Continuar con el Pago"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_heart</span>
              <span>Mis Reservas</span>
              {(() => {
                const pendingPay = reservations.filter(
                  (r) =>
                    (r.userEmail === session.email) &&
                    r.status === 'CONFIRMED' &&
                    r.paymentStatus !== 'PAID'
                ).length;
                return pendingPay > 0 ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-900">
                    {pendingPay}
                  </span>
                ) : null;
              })()}
            </button>

            {/* ADMIN ONLY CRUD 1: HABITACIONES */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('habitaciones')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'habitaciones'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="CRUD Maestro de Habitaciones y Suites (Solo Admin)"
              >
                <span className="material-symbols-outlined text-[16px]">hotel</span>
                <span>Habitaciones</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-900/90 text-indigo-300 border border-indigo-500/40">
                  ADMIN
                </span>
              </button>
            )}

            {/* ADMIN ONLY CRUD 2: CENTROS DE DESPACHO */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('centros_despacho')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'centros_despacho'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="CRUD Maestro de Centros de Despacho (Solo Admin)"
              >
                <span className="material-symbols-outlined text-[16px]">warehouse</span>
                <span>Centros de Despacho</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-900/90 text-indigo-300 border border-indigo-500/40">
                  ADMIN
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('how_it_works')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'how_it_works'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Cómo Funciona y Arquitectura</span>
            </button>

            <button
              onClick={() => setActiveTab('swagger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'swagger'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">api</span>
              <span>Swagger / OpenAPI</span>
            </button>

            <button
              onClick={() => setActiveTab('qa_tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'qa_tests'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Pruebas QA (JUnit 5)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              <span>Configuración</span>
            </button>
          </nav>
        </div>

        {/* User Session & Fast Profile Pill */}
        <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white leading-tight">{session.fullName}</span>
            <div className="flex items-center gap-1 justify-end">
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isAdmin ? 'bg-indigo-900/80 text-indigo-300' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {session.role}
              </span>
              <span className="text-[10px] font-mono text-slate-400">Nodo: {session.terminalId}</span>
            </div>
          </div>

          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-md object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {session.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[100] animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Perfil
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION TABS */}
      <div className="lg:hidden flex items-center justify-around bg-[#091426] border-b border-slate-800 text-xs py-2 px-1 text-slate-300 overflow-x-auto">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2 py-1 rounded font-semibold shrink-0 ${
              activeTab === 'overview' ? 'text-white bg-indigo-600' : 'hover:text-white'
            }`}
          >
            Despacho
          </button>
        )}

        <button
          onClick={() => setActiveTab('carrusel_compra')}
          className={`px-2 py-1 rounded font-semibold shrink-0 flex items-center gap-1 ${
            activeTab === 'carrusel_compra' ? 'text-white bg-indigo-600' : 'hover:text-white text-emerald-400'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">hotel_class</span>
          <span>Carrusel</span>
        </button>

        <button
          onClick={() => setActiveTab('mis_reservas')}
          className={`px-2 py-1 rounded font-semibold shrink-0 flex items-center gap-1 ${
            activeTab === 'mis_reservas' ? 'text-white bg-indigo-600' : 'hover:text-white text-emerald-400'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">bookmark_heart</span>
          <span>Mis Reservas</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('habitaciones')}
            className={`px-2 py-1 rounded font-semibold shrink-0 ${
              activeTab === 'habitaciones' ? 'text-white bg-indigo-600' : 'hover:text-white'
            }`}
          >
            Habitaciones
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('centros_despacho')}
            className={`px-2 py-1 rounded font-semibold shrink-0 ${
              activeTab === 'centros_despacho' ? 'text-white bg-indigo-600' : 'hover:text-white'
            }`}
          >
            Centros
          </button>
        )}

        <button
          onClick={() => setActiveTab('how_it_works')}
          className={`px-2 py-1 rounded font-semibold shrink-0 ${
            activeTab === 'how_it_works' ? 'text-white bg-indigo-600' : 'hover:text-white'
          }`}
        >
          Arquitectura
        </button>
        <button
          onClick={() => setActiveTab('swagger')}
          className={`px-2 py-1 rounded font-semibold shrink-0 ${
            activeTab === 'swagger' ? 'text-white bg-indigo-600' : 'hover:text-white'
          }`}
        >
          OpenAPI
        </button>
        <button
          onClick={() => setActiveTab('qa_tests')}
          className={`px-2 py-1 rounded font-semibold shrink-0 ${
            activeTab === 'qa_tests' ? 'text-white bg-indigo-600' : 'hover:text-white'
          }`}
        >
          Pruebas QA
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-2 py-1 rounded font-semibold shrink-0 ${
            activeTab === 'settings' ? 'text-white bg-indigo-600' : 'hover:text-white'
          }`}
        >
          Configuración
        </button>
      </div>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        {activeTab === 'overview' && isAdmin && (
          <ExecutiveDashboard
            session={session}
            depots={depots}
            assets={assets}
            reservations={reservations}
            alerts={alerts}
            onOpenNewReservation={() => {
              setInitialBookingItem(null);
              setIsNewModalOpen(true);
            }}
            onSelectReservation={(res) => setSelectedReservation(res)}
            onFastDispatch={handleFastDispatch}
            onApproveReservation={handleApproveReservation}
            onSwitchRole={handleSwitchRole}
            onAlertAction={handleAlertAction}
            onNavigateToCarousel={() => setActiveTab('carrusel_compra')}
          />
        )}

        {/* CARRUSEL DE COMPRA Y RESERVA POR PARTE DEL USUARIO */}
        {activeTab === 'carrusel_compra' && (
          <BookingCarousel
            rooms={rooms}
            assets={assets}
            depots={depots}
            reservations={reservations}
            onBookItem={handleBookFromCarousel}
            currentUserEmail={session.email}
          />
        )}

        {/* MIS RESERVAS (CLIENTE) — VER ESTADO Y CONTINUAR CON EL PAGO */}
        {activeTab === 'mis_reservas' && (
          <ClientReservations
            reservations={reservations}
            currentUserEmail={session.email}
            customerName={session.fullName}
            onPayReservation={handlePayReservation}
            onCancelReservation={handleCancelReservation}
            onNavigateToCarousel={() => setActiveTab('carrusel_compra')}
          />
        )}

        {/* ADMIN ONLY CRUD 1: HABITACIONES */}
        {activeTab === 'habitaciones' && (
          <RoomsManagement
            session={session}
            rooms={rooms}
            depots={depots}
            reservations={reservations}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onFastStatusChange={handleFastRoomStatusChange}
          />
        )}

        {/* ADMIN ONLY CRUD 2: CENTROS DE DESPACHO */}
        {activeTab === 'centros_despacho' && (
          <DepotsManagement
            session={session}
            depots={depots}
            rooms={rooms}
            assets={assets}
            reservations={reservations}
            onAddDepot={handleAddDepot}
            onUpdateDepot={handleUpdateDepot}
            onDeleteDepot={handleDeleteDepot}
          />
        )}

        {activeTab === 'how_it_works' && <ArchitectureGuide />}

        {activeTab === 'swagger' && <SwaggerExplorer session={session} />}

        {activeTab === 'qa_tests' && <QaTestRunner />}

        {activeTab === 'settings' && (
          <EnterpriseSettings settings={settings} onSaveSettings={(up) => setSettings(up)} />
        )}
      </main>

      {/* NEW RESERVATION MODAL */}
      <NewReservationModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setInitialBookingItem(null);
        }}
        assets={assets}
        rooms={rooms}
        depots={depots}
        reservations={reservations}
        onReservationCreated={handleReservationCreated}
        currentUserEmail={session.email}
        initialCategory={initialBookingItem?.type || 'ROOM'}
        initialItemId={initialBookingItem?.id || null}
      />

      {/* RESERVATION DETAIL & LINE-ITEM BREAKDOWN DRAWER */}
      <ReservationDetailDrawer
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        userRole={session.role}
        onDispatch={handleFastDispatch}
        onComplete={handleCompleteReservation}
        onCancel={handleCancelReservation}
        onDelete={handleDeleteReservation}
        onApprove={handleApproveReservation}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        session={session}
        profile={profile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleUpdateProfile}
        onReturnHome={() => {
          setIsProfileModalOpen(false);
          setActiveTab(session.role === 'ROLE_ADMIN' ? 'overview' : 'carrusel_compra');
        }}
      />
    </div>
  );
};

export default App;
