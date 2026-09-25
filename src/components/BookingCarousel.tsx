import React, { useState, useRef, useEffect } from 'react';
import { HospitalityRoom, Asset, Depot, Reservation } from '../types';

interface BookingCarouselProps {
  rooms: HospitalityRoom[];
  assets: Asset[];
  depots: Depot[];
  reservations: Reservation[];
  onBookItem: (type: 'ROOM', id: number) => void;
  currentUserEmail: string;
}

// Catálogo enriquecido con imágenes temáticas de alta calidad y atributos para hospitalidad
interface CarouselProduct {
  id: number;
  itemType: 'ROOM';
  code: string;
  name: string;
  subtitle: string;
  categoryName: string;
  categoryKey: string;
  depotCode: string;
  depotName: string;
  city: string;
  hourlyRate: number;
  dailyRate: number;
  capacityText: string;
  status: string;
  cleanlinessScore: number;
  iotLockOrSerial: string;
  amenities: string[];
  imageUrl: string;
  badgeText: string;
  description: string;
}

export const BookingCarousel: React.FC<BookingCarouselProps> = ({
  rooms,
  assets,
  depots,
  reservations,
  onBookItem,
  currentUserEmail,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepot, setSelectedDepot] = useState<string>('ALL');
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Imágenes curadas para cada tipo de suite y activo
  const getRoomImage = (room: HospitalityRoom): string => {
    switch (room.category) {
      case 'EXECUTIVE_SUITE':
        return 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
      case 'CREW_REST_CABIN':
        return 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
      case 'LONG_HAUL_VIP':
        return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
      default:
        return 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80';
    }
  };

  // Convertir las habitaciones a productos unificados para el carrusel de compra
  const products: CarouselProduct[] = [
    // 1. Habitaciones
    ...rooms.map((room) => {
      const depot = depots.find((d) => d.id === room.depotId || d.code === room.depotCode);
      return {
        id: room.id,
        itemType: 'ROOM' as const,
        code: room.roomNumber,
        name: room.name,
        subtitle: `Piso ${room.floor} • Cerradura IoT ${room.iotLockId}`,
        categoryName:
          room.category === 'EXECUTIVE_SUITE'
            ? 'Suite Ejecutiva'
            : room.category === 'CREW_REST_CABIN'
            ? 'Cabina de Descanso'
            : room.category === 'LONG_HAUL_VIP'
            ? 'Suite Presidencial VIP'
            : 'Habitación Estándar',
        categoryKey: room.category,
        depotCode: room.depotCode,
        depotName: depot ? depot.name : `Terminal ${room.depotCode}`,
        city: depot ? `${depot.city}, ${depot.state}` : 'Centro Logístico',
        hourlyRate: room.baseHourlyRate,
        dailyRate: room.pricePerNight,
        capacityText: `${room.capacityPersons} ${room.capacityPersons === 1 ? 'persona' : 'personas'}`,
        status: room.status,
        cleanlinessScore: room.cleanlinessScore,
        iotLockOrSerial: room.iotLockId,
        amenities: room.amenities || ['Cerradura Inteligente', 'Climatización Smart', 'Wi-Fi 6E'],
        imageUrl: getRoomImage(room),
        badgeText:
          room.status === 'AVAILABLE'
            ? 'DISPONIBLE'
            : room.status === 'CLEANING_DISINFECTION'
            ? 'HIGIENIZACIÓN (35 min)'
            : room.status === 'OCCUPIED'
            ? 'OCUPADA'
            : 'MANTENIMIENTO',
        description: room.notes || 'Habitación con altos estándares de bioseguridad para descanso corporativo.',
      };
    }),
  ];

  // Aplicar filtros de categoría y centro
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'ROOMS' && p.itemType === 'ROOM') ||
      p.categoryKey === selectedCategory;

    const matchesDepot = selectedDepot === 'ALL' || p.depotCode === selectedDepot;

    return matchesCategory && matchesDepot;
  });

  // Asegurar que el índice esté dentro del rango al filtrar
  useEffect(() => {
    if (currentIndex >= filteredProducts.length) {
      setCurrentIndex(0);
    }
  }, [filteredProducts.length, currentIndex]);

  // Autoplay handler
  useEffect(() => {
    if (isAutoPlay && filteredProducts.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
      }, 5000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, filteredProducts.length]);

  const handleNext = () => {
    if (filteredProducts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
  };

  const handlePrev = () => {
    if (filteredProducts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
  };

  const activeProduct = filteredProducts[currentIndex] || filteredProducts[0];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION & HERO BANNER */}
      <div className="bg-gradient-to-r from-[#091426] via-[#102444] to-[#1e1b4b] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <span className="material-symbols-outlined text-[14px]">hotel_class</span>
                CARRUSEL DE COMPRA Y RESERVA
              </span>
              <span className="text-xs text-slate-300 font-mono hidden sm:inline">
                SLA Zero-Trust • Margen de 35 min
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Catálogo de Suites Hoteleras y Habitaciones
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explora y reserva en tiempo real suites de descanso para tripulación, cabinas de relevo y habitaciones corporativas con verificación instantánea de cerraduras IoT y bioseguridad.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs">
            <div className="flex justify-between sm:gap-6">
              <span className="text-slate-300">Inventario Total:</span>
              <span className="font-bold font-mono text-emerald-400">{products.length} unidades</span>
            </div>
            <div className="flex justify-between sm:gap-6">
              <span className="text-slate-300">Margen Bioseguro:</span>
              <span className="font-bold font-mono text-sky-300">35 min obligatorio</span>
            </div>
            <div className="flex justify-between sm:gap-6">
              <span className="text-slate-300">Cerraduras Digitales:</span>
              <span className="font-bold font-mono text-indigo-300">100% IoT Online</span>
            </div>
          </div>
        </div>

        {/* Category & Hub Filter Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Categories Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {[
              { id: 'ALL', label: 'Todo el Inventario', icon: 'apps' },
              { id: 'ROOMS', label: 'Todas las Habitaciones', icon: 'hotel' },
              { id: 'EXECUTIVE_SUITE', label: 'Suites Ejecutivas', icon: 'king_bed' },
              { id: 'CREW_REST_CABIN', label: 'Cabinas de Descanso', icon: 'single_bed' },
              { id: 'STANDARD_ROOM', label: 'Habitaciones Estándar', icon: 'bed' },
              { id: 'LONG_HAUL_VIP', label: 'Suites VIP Presidenciales', icon: 'star' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Depot Dropdown & AutoPlay Switch */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDepot}
              onChange={(e) => {
                setSelectedDepot(e.target.value);
                setCurrentIndex(0);
              }}
              className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="ALL" className="bg-slate-900 text-white">Todos los Centros</option>
              {depots.map((d) => (
                <option key={d.id} value={d.code} className="bg-slate-900 text-white">
                  {d.code} — {d.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              title={isAutoPlay ? 'Pausar Carrusel Automático' : 'Reproducir Carrusel Automático'}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                isAutoPlay
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isAutoPlay ? 'pause' : 'play_arrow'}
              </span>
              <span className="hidden sm:inline">{isAutoPlay ? 'Pausa' : 'Auto'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CAROUSEL MAIN STAGE */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">filter_alt_off</span>
          </div>
          <h3 className="text-base font-bold text-slate-800">No hay habitaciones con los filtros seleccionados</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba seleccionando "Todo el Inventario" o cambiando el Centro de Despacho.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedDepot('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
          >
            Restablecer Filtros del Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Carousel Viewport Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
              {/* Product Visual Banner (7 Cols) */}
              <div className="lg:col-span-7 relative bg-slate-950 overflow-hidden group">
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-96 lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono shadow-sm flex items-center gap-1 ${
                      activeProduct.status === 'AVAILABLE'
                        ? 'bg-emerald-500 text-white'
                        : activeProduct.status === 'CLEANING_DISINFECTION'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {activeProduct.badgeText}
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-900/80 text-white border border-white/20 backdrop-blur-md">
                    {activeProduct.categoryName}
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 backdrop-blur-md">
                    Hub: {activeProduct.depotCode}
                  </span>
                </div>

                {/* Bottom Image Overlay Details */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono mb-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>{activeProduct.depotName} • {activeProduct.city}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
                    {activeProduct.name}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    Código de Registro: {activeProduct.code} • {activeProduct.subtitle}
                  </p>
                </div>

                {/* Floating Navigation Controls on Image */}
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <button
                    onClick={handlePrev}
                    aria-label="Activo anterior"
                    className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-indigo-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                  </button>
                </div>

                <div className="absolute inset-y-0 right-2 flex items-center">
                  <button
                    onClick={handleNext}
                    aria-label="Siguiente activo"
                    className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-indigo-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Product Purchase & Specifications Panel (5 Cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
                <div className="space-y-4">
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Hospedaje Certificado CDC/OSHA</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span className="material-symbols-outlined text-[14px]">sanitizer</span>
                      <span>Higiene: {activeProduct.cleanlinessScore}%</span>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs text-slate-500 font-medium">Tarifa Corporativa por Hora</div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-extrabold text-slate-900 font-mono">
                        ${activeProduct.hourlyRate.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-600 font-semibold">USD / hora</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <span>Tarifa por Estadía Completa (24h):</span>
                      <span className="font-mono font-bold text-slate-900">${activeProduct.dailyRate.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Core Features Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[11px] text-slate-500 block font-medium">Capacidad Máxima:</span>
                      <span className="font-bold text-slate-800 font-mono">{activeProduct.capacityText}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[11px] text-slate-500 block font-medium">Cerradura / Telemetría:</span>
                      <span className="font-bold text-indigo-700 font-mono truncate block" title={activeProduct.iotLockOrSerial}>
                        {activeProduct.iotLockOrSerial}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeProduct.description}
                  </p>

                  {/* Amenities List */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">
                      Amenidades y Equipamiento Incluido:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProduct.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
                        >
                          <span className="material-symbols-outlined text-[13px] text-emerald-600">check</span>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 35-min Sanitization Notice */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600 shrink-0 mt-0.5">
                      shield
                    </span>
                    <span>
                      <strong>Protección de Turnaround:</strong> Se aplica automáticamente una ventana de <strong>35 minutos de higienización certificada</strong> entre estancias consecutivas para garantizar el cumplimiento de normativas de salud y descanso.
                    </span>
                  </div>
                </div>

                {/* Primary Purchase / Book Action Button */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => onBookItem(activeProduct.itemType, activeProduct.id)}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                      shopping_cart
                    </span>
                    <span>Reservar Esta Habitación Ahora</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                    <span>Sin cargos ocultos • Cancelación con SLA</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      Checkout Seguro JWT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CAROUSEL THUMBNAIL TRACKER & PAGINATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Activo {currentIndex + 1} de {filteredProducts.length}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Navega con las flechas o selecciona directamente una miniatura
              </span>
            </div>

            {/* Thumbnail Pills / Dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {filteredProducts.map((p, idx) => (
                <button
                  key={p.code + idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-indigo-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Ir al activo ${idx + 1}: ${p.name}`}
                  title={`${p.name} (${p.code})`}
                />
              ))}
            </div>

            {/* Previous / Next Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Anterior</span>
              </button>

              <button
                onClick={handleNext}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>Siguiente</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* GRID OF QUICK DISCOVERY CARDS */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">grid_view</span>
                <span>Selección Rápida de Inventario</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-mono font-bold">
                  {filteredProducts.filter((p) => p.itemType === 'ROOM').length} habitaciones
                </span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Haz clic en cualquier tarjeta para verla en el carrusel principal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p, idx) => (
                <div
                  key={p.code}
                  onClick={() => setCurrentIndex(idx)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all text-left group bg-white ${
                    idx === currentIndex
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="relative h-28 rounded-lg overflow-hidden mb-2.5 bg-slate-900">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-md">
                        {p.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5 backdrop-blur-md bg-indigo-600/90 text-white">
                        <span className="material-symbols-outlined text-[12px]">hotel</span>
                        Habitación
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-600 text-white">
                        ${p.hourlyRate}/h
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                    <span>{p.categoryName}</span>
                    <span className="font-bold text-indigo-600">{p.depotCode}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </h4>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">{p.capacityText}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookItem(p.itemType, p.id);
                      }}
                      className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Reservar</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
