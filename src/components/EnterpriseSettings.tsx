import React, { useState } from 'react';
import { SystemSettings } from '../types';

interface EnterpriseSettingsProps {
  settings: SystemSettings;
  onSaveSettings: (updated: SystemSettings) => void;
}

export const EnterpriseSettings: React.FC<EnterpriseSettingsProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<string>('DISPATCH_RULES');
  const [current, setCurrent] = useState<SystemSettings>({ ...settings });
  const [saveToast, setSaveToast] = useState(false);

  const handleRotateKey = () => {
    const chars = '0123456789abcdef';
    let newHash = '';
    for (let i = 0; i < 64; i++) {
      newHash += chars[Math.floor(Math.random() * chars.length)];
    }
    setCurrent({ ...current, kmsKeyHash: newHash });
    alert('¡Secreto KMS rotado! Nueva clave SHA-256 inicializada. Los tokens JWT activos se actualizarán.');
  };

  const handleSave = () => {
    onSaveSettings(current);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Settings Header (Exact Stitch Image 13) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Configuración Empresarial y Parámetros del Sistema</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure umbrales de despacho automatizado, matriz de precios SLA, políticas de tokens criptográficos y puentes telemáticos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrent({ ...settings })}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            Restablecer Valores
          </button>
          <button
            onClick={() => {
              const yaml = `
# ReserveHub Enterprise Production Config
dispatch:
  turnaround_buffer_minutes: ${current.turnaroundBufferMinutes}
  strict_housekeeping_lock: ${current.strictHousekeepingLock}
security:
  jwt_lifetime: "${current.jwtBearerLifetime}"
  fido2_required: ${current.mandateFido2Keys}
  kms_sha256: "${current.kmsKeyHash}"
              `.trim();
              navigator.clipboard?.writeText(yaml);
              alert('¡Configuración del sistema YAML copiada al portapapeles!');
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Exportar YAML de Configuración
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Guardar Cambios
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Configuración del sistema y parámetros SLA actualizados con éxito en todo el clúster.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-4 rounded-t-xl overflow-x-auto">
        {[
          { id: 'DISPATCH_RULES', label: 'Reglas de Reserva y Rotación', icon: 'route' },
          { id: 'SECURITY_TOKEN', label: 'Políticas de Seguridad y Tokens', icon: 'shield' },
          { id: 'TELEMATICS_API', label: 'Integraciones y Puentes API', icon: 'hub' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Dispatch & Routing Rules */}
      {activeTab === 'DISPATCH_RULES' && (
        <div className="space-y-6">
          {/* Dispatch Automation Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automatización de Despacho y Asignación Automática</h3>
              <p className="text-xs text-slate-500">
                Controle la asignación algorítmica de suites y los márgenes de seguridad para la prevención de colisiones.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Toggle 1: Housekeeping certification */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Bloqueo Estricto de Limpieza y Auditoría de Habitación
                  </span>
                  <span className="text-xs text-slate-500">
                    Prohibir la confirmación de la reserva si la auditoría de limpieza de la suite está pendiente.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={current.strictHousekeepingLock}
                  onChange={(e) =>
                    setCurrent({ ...current, strictHousekeepingLock: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600"
                />
              </div>

              {/* Turnaround Buffer: 35 minutes */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Margen Obligatorio de Rotación e Higienización de la Estancia
                  </span>
                  <span className="text-xs text-slate-500">
                    Tiempo de seguridad obligatorio aplicado entre reservas consecutivas sobre el mismo activo.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={current.turnaroundBufferMinutes}
                    onChange={(e) =>
                      setCurrent({ ...current, turnaroundBufferMinutes: Number(e.target.value) })
                    }
                    className="w-20 text-xs py-1.5 px-2 border border-slate-300 rounded font-mono text-center font-bold"
                  />
                  <span className="text-xs text-slate-600 font-medium">Minutos</span>
                </div>
              </div>

              {/* Toggle 3: Hospitality PMS */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Sincronización con PMS Hotelero y Limpieza
                  </span>
                  <span className="text-xs text-slate-500">
                    Activar automáticamente la apertura de cerradura inteligente IoT tras la finalización móvil de limpieza.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={current.hospitalityPmsSync}
                  onChange={(e) => setCurrent({ ...current, hospitalityPmsSync: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* SLA Compliance Box */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Tasa Actual de Cumplimiento Automatizado SLA:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                99.41% Garantizado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Security & Token Policies */}
      {activeTab === 'SECURITY_TOKEN' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Auditoría Criptográfica y Políticas de Seguridad JWT</h3>
              <p className="text-xs text-slate-500">
                Reglas de autenticación stateless bearer Zero-Trust y verificación de claves ligadas a hardware.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* JWT Lifetime */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Tiempo de Vida del Token JWT</span>
                  <span className="text-xs text-slate-500">Ventana de expiración para tokens de acceso de corta duración.</span>
                </div>
                <select
                  value={current.jwtBearerLifetime}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      jwtBearerLifetime: e.target.value as '15m' | '60m' | '8h',
                    })
                  }
                  className="text-xs py-1.5 px-3 border border-slate-300 rounded bg-white font-mono"
                >
                  <option value="15m">15 Minutos (Estándar Zero-Trust)</option>
                  <option value="60m">60 Minutos (Sesión Estándar)</option>
                  <option value="8h">8 Horas (Turno Extendido)</option>
                </select>
              </div>

              {/* FIDO2 */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Exigir Llaves Físicas FIDO2 / WebAuthn
                  </span>
                  <span className="text-xs text-slate-500">
                    Requerir toque físico de llave de hardware YubiKey para confirmar reservas de suites de alto valor.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={current.mandateFido2Keys}
                  onChange={(e) => setCurrent({ ...current, mandateFido2Keys: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600"
                />
              </div>

              {/* Active KMS Key Hash */}
              <div className="py-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Hash de Clave KMS Activa (SHA-256)
                    </span>
                    <span className="text-xs text-slate-500">
                      Clave de firma criptográfica utilizada para firmar tokens HS256.
                    </span>
                  </div>
                  <button
                    onClick={handleRotateKey}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                  >
                    Rotar Secreto e Invalidar Sesiones Activas
                  </button>
                </div>
                <div className="p-2.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded break-all select-all">
                  {current.kmsKeyHash}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Integrations & API Bridges */}
      {activeTab === 'TELEMATICS_API' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Integraciones Empresariales y Webhooks Críticos
            </h3>
            <p className="text-xs text-slate-500">
              Endpoints de integración con PMS hoteleros, cerraduras IoT y directorios corporativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">Okta Enterprise SSO</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  ACTIVO
                </span>
              </div>
              <p className="text-xs text-slate-600">Sincronización de directorio SAML 2.0 / SCIM.</p>
              <div className="mt-3 text-[11px] font-mono text-slate-500">Latencia: 28ms</div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">Hook PMS Hotelero / Cerraduras IoT</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  ACTIVO
                </span>
              </div>
              <p className="text-xs text-slate-600">Sincronización de ocupación y estado de cerraduras inteligentes.</p>
              <div className="mt-3 text-[11px] font-mono text-slate-500">4,892 ops/min</div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">Facturación Stripe y Garantía Escrow</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                  CONECTADO
                </span>
              </div>
              <p className="text-xs text-slate-600">Facturación automatizada Net-30 y conciliación de servicios de hospitalidad.</p>
              <div className="mt-3 text-[11px] font-mono text-slate-500">Garantía SLA: $500,000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
