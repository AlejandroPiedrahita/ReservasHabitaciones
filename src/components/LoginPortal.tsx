import React, { useState, useEffect } from 'react';
import { Role, UserSession } from '../types';

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [selectedProfile, setSelectedProfile] = useState<'admin' | 'user'>('admin');
  const [email, setEmail] = useState('admin@admin.co');
  const [password, setPassword] = useState('Admin#2026$Pass');
  const [showPassword, setShowPassword] = useState(false);
  const [totpDigits, setTotpDigits] = useState(['7', '4', '9', '3', '1', '2']);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [totpTimer, setTotpTimer] = useState(28);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer countdown for TOTP code
  useEffect(() => {
    const interval = setInterval(() => {
      setTotpTimer((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectProfile = (profile: 'admin' | 'user') => {
    setSelectedProfile(profile);
    setErrorMessage(null);
    if (profile === 'admin') {
      setEmail('admin@admin.co');
      setPassword('Admin#2026$Pass');
      setTotpDigits(['7', '4', '9', '3', '1', '2']);
    } else {
      setEmail('cliente1@admin.co');
      setPassword('Cliente1#2026$Pass');
      setTotpDigits(['8', '1', '5', '4', '2', '0']);
    }
  };

  const handleTotpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...totpDigits];
    updated[index] = val;
    setTotpDigits(updated);

    // Auto-focus next input if filled
    if (val && index < 5) {
      const nextInput = document.getElementById(`totp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsAuthenticating(false);
      const normalizedEmail = email.trim().toLowerCase();
      const isLoginAdmin = normalizedEmail === 'admin@admin.co';

      const role: Role = isLoginAdmin ? 'ROLE_ADMIN' : 'ROLE_CLIENTE';
      const fullName = isLoginAdmin ? 'admin' : 'cliente1';
      const userEmail = isLoginAdmin ? 'admin@admin.co' : 'cliente1@admin.co';

      const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: userEmail,
          role,
          terminalId: 'RBH-882',
          iss: 'reservehub-enterprise-auth-gateway',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (rememberTerminal ? 30 * 86400 : 3600),
        })
      )}.sig_${Math.random().toString(36).substring(2, 15)}`;

      onLoginSuccess({
        userId: isLoginAdmin ? 1 : 2,
        email: userEmail,
        fullName,
        role,
        terminalId: 'RBH-882',
        accessToken: fakeJwt,
        tokenType: 'Bearer',
        expiresInMs: rememberTerminal ? 30 * 24 * 3600 * 1000 : 3600 * 1000,
        mfaVerified: true,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen w-full antialiased font-sans text-slate-900 bg-[#f8f9ff] flex flex-col lg:flex-row overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* PANEL IZQUIERDO: Identidad Empresarial y Métricas (visible en pantallas grandes lg+) */}
      <aside className="relative hidden lg:flex lg:w-[45%] xl:w-[42%] bg-[#091426] flex-col justify-between p-6 xl:p-12 text-white overflow-y-auto border-r border-slate-800">
        {/* Elementos de fondo técnico abstracto */}
        <div className="absolute inset-0 grid-bg-pattern opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Barra superior del panel: Marca y Versión */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined filled text-[24px]">deployed_code</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white leading-none">ReserveHub</h1>
                <p className="text-xs text-slate-400 mt-1">Operaciones de Hospitalidad Enterprise</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Pasarela v4.2
            </span>
          </div>

          {/* Declaración de Valor Central */}
          <div className="mt-10 xl:mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-[15px]">security</span>
              Control de Infraestructura de Misión Crítica
            </div>
            <h2 className="text-2xl xl:text-4xl font-bold text-white tracking-tight max-w-lg leading-tight">
              Logística de despacho y gestión de reservas empresariales.
            </h2>
            <p className="mt-3 xl:mt-4 text-sm text-slate-300 leading-relaxed max-w-lg">
              Plataforma centralizada para la coordinación de suites y habitaciones de hospitalidad con verificación continua y políticas de acceso Zero-Trust.
            </p>
          </div>

          {/* Pilares Operativos y Arquitectónicos del Sistema */}
          <div className="mt-6 xl:mt-8 space-y-3 max-w-lg">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/20">
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reserva de Hospitalidad Coordinada</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Asignación y seguimiento de suites ejecutivas, cabinas de descanso y habitaciones corporativas en una sola consola unificada.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Motor Anticolisión Determinista</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Validación algorítmica de solapamiento en tiempo real con margen preventivo obligatorio de 35 minutos de higienización.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Seguridad Stateless y RBAC</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Autenticación basada en JWT, contraseñas cifradas con BCrypt y autorización declarativa mediante anotaciones Spring Security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sellos de Cumplimiento y Seguridad Normativa */}
        <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">verified_user</span>
              <span>SOC2 Tipo II</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">lock_clock</span>
              <span>ISO 27001</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">key</span>
              <span>SAML 2.0 / JWT</span>
            </div>
          </div>
        </div>
      </aside>

      {/* PANEL DERECHO: Formulario de Autenticación Corporativa (100% en móvil, centrado, totalmente responsive) */}
      <main className="flex-1 flex flex-col justify-center items-center px-3 sm:px-6 md:px-8 py-6 sm:py-10 bg-[#f8f9ff] relative overflow-y-auto w-full">
        {/* Barra superior móvil / tablet */}
        <div className="lg:hidden w-full max-w-[480px] flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined filled text-[20px]">deployed_code</span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight">ReserveHub</span>
              <span className="text-[10px] text-slate-500 block">Consola Empresarial</span>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">v4.2</span>
        </div>

        {/* Tarjeta Centrada Responsive */}
        <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xs sm:shadow-sm p-4 sm:p-6 md:p-8 transition-all">
          {/* Encabezado de la Tarjeta */}
          <div className="mb-4 sm:mb-5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-indigo-700 text-[11px] sm:text-xs font-mono mb-2">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Nodo Seguro de Autorización
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Iniciar sesión en el Portal</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seleccione el perfil de prueba o ingrese sus credenciales para acceder a la plataforma.
            </p>
          </div>

          {/* PANEL EXTRA RESPONSIVE: SELECCIÓN DE ADMIN O USUARIO CON INFORMACIÓN DE LOGEO QUEMADA EN CÓDIGO */}
          <div className="mb-5 sm:mb-6 rounded-xl border border-indigo-100 bg-slate-50/70 p-3 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">account_box</span>
                Panel de Credenciales Quemadas
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                MODO TEST
              </span>
            </div>

            {/* Pestañas para elegir Admin o Usuario */}
            <div className="grid grid-cols-2 p-1 bg-slate-200/70 border border-slate-200 rounded-lg gap-1 mb-2.5">
              <button
                type="button"
                id="select-admin-profile-btn"
                onClick={() => handleSelectProfile('admin')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3 rounded-md font-semibold text-[11px] sm:text-xs transition-all ${
                  selectedProfile === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">admin_panel_settings</span>
                <span className="truncate">Admin (admin)</span>
              </button>

              <button
                type="button"
                id="select-user-profile-btn"
                onClick={() => handleSelectProfile('user')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3 rounded-md font-semibold text-[11px] sm:text-xs transition-all ${
                  selectedProfile === 'user'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">person</span>
                <span className="truncate">Usuario (cliente1)</span>
              </button>
            </div>

            {/* Información del Logeo Quemada en el Código */}
            {selectedProfile === 'admin' ? (
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-indigo-100 text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px] sm:text-xs">
                    <span className="material-symbols-outlined text-indigo-600 text-[15px]">verified</span>
                    Datos Quemados: Administrador
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                    ROLE_ADMIN
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] font-mono">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Nombre</span>
                    <span className="font-bold text-slate-900">admin</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 overflow-hidden">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Correo</span>
                    <span className="font-bold text-indigo-700 truncate block" title="admin@admin.co">
                      admin@admin.co
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 overflow-hidden">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Contraseña</span>
                    <span className="font-bold text-slate-800 truncate block">Admin#2026$Pass</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">MFA / TOTP</span>
                    <span className="font-bold text-emerald-600">749-312</span>
                  </div>
                </div>
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-500">
                  <span>Privilegios totales (despacho, cancelación y purga).</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Cargado en formulario
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-indigo-100 text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px] sm:text-xs">
                    <span className="material-symbols-outlined text-indigo-600 text-[15px]">verified</span>
                    Datos Quemados: Usuario Normal
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                    ROLE_CLIENTE
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] font-mono">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Nombre</span>
                    <span className="font-bold text-slate-900">cliente1</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 overflow-hidden">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Correo</span>
                    <span className="font-bold text-indigo-700 truncate block" title="cliente1@admin.co">
                      cliente1@admin.co
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 overflow-hidden">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Contraseña</span>
                    <span className="font-bold text-slate-800 truncate block">Cliente1#2026$Pass</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">MFA / TOTP</span>
                    <span className="font-bold text-emerald-600">815-420</span>
                  </div>
                </div>
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-500">
                  <span>Gestión de reservas propias (403 en despacho rápido).</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Cargado en formulario
                  </span>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORMULARIO DE CREDENCIALES */}
          <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
            {/* Correo Corporativo */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1" htmlFor="corporate-email">
                Correo Electrónico Corporativo
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <input
                  id="corporate-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors min-h-[44px]"
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800" htmlFor="corporate-password">
                  Contraseña de la Cuenta
                </label>
                <button
                  type="button"
                  onClick={() => alert('El restablecimiento de contraseña está gestionado mediante Active Directory / Okta SSO.')}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </div>
                <input
                  id="corporate-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-16 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors min-h-[44px]"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 min-h-[44px]"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {/* AUTENTICACIÓN MULTIFACTOR (MFA / 2FA) */}
            <div className="pt-1">
              <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">phonelink_lock</span>
                    <span className="text-xs font-semibold text-slate-800">Autenticador Corporativo (TOTP)</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Expira en {totpTimer}s
                  </span>
                </div>

                {/* Cajas de entrada de 6 dígitos con ajuste fluido y responsive */}
                <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto py-1">
                  {totpDigits.map((digit, idx) => (
                    <React.Fragment key={idx}>
                      {idx === 3 && <span className="text-slate-400 font-bold px-0.5 text-sm sm:text-base">-</span>}
                      <input
                        id={`totp-box-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleTotpChange(idx, e.target.value)}
                        className="w-9 sm:w-10 md:w-11 h-10 sm:h-11 md:h-12 text-center text-sm sm:text-base font-mono font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shrink-0"
                      />
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => alert('Notificación push a token físico YubiKey / WebAuthn simulada con éxito.')}
                    className="text-[11px] font-mono text-indigo-600 hover:underline"
                  >
                    Enviar notificación push a YubiKey / Token físico
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox de persistencia de terminal */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-600 select-none">Recordar esta terminal empresarial (30 días)</span>
              </label>
            </div>

            {/* CTA Principal: Sesión JWT */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full min-h-[44px] h-11 flex items-center justify-center gap-2 rounded-lg bg-[#091426] hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Emitiendo Sesión JWT Zero-Trust...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined filled text-[18px]">lock</span>
                  <span>Iniciar Sesión mediante Token JWT</span>
                </>
              )}
            </button>
          </form>

          {/* Divisor SSO */}
          <div className="relative my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 uppercase tracking-wider font-semibold text-[10px] sm:text-xs text-center">
                o autenticar mediante Inicio de Sesión Único (SSO)
              </span>
            </div>
          </div>

          {/* Botones Proveedores SSO en layout responsive (1 col en móvil angosto, 2 cols en pantallas medianas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => handleSelectProfile('admin')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 min-h-[42px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">grid_view</span>
              <span className="truncate">Azure AD (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectProfile('user')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 min-h-[42px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-red-600">corporate_fare</span>
              <span className="truncate">Google (Cliente1)</span>
            </button>
          </div>

          {/* Pie de Cumplimiento y Registro de Auditoría */}
          <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
              <span>Protegido por ReserveHub Shield</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span>Registro de Auditoría Activo</span>
            </div>
          </div>
        </div>

        {/* Enlaces Legales Responsive */}
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-[11px] sm:text-xs text-slate-500 max-w-[480px]">
          <a href="#" className="hover:text-slate-900 transition-colors">Directiva de Privacidad</a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-slate-900 transition-colors">Términos de Despacho SLA</a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-slate-900 transition-colors">Línea de Incidentes de Seguridad</a>
        </div>
      </main>
    </div>
  );
};
