import React, { useState, useEffect } from 'react';
import { UserSession, UserProfile } from '../types';
import { updateUserProfile } from '../api/userApi';

interface UserProfileModalProps {
  isOpen: boolean;
  session: UserSession;
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (data: UserProfile) => void;
  onReturnHome: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  session,
  profile,
  onClose,
  onSave,
  onReturnHome,
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else {
      setFormData({
        userId: session.userId,
        email: session.email,
        fullName: session.fullName,
      });
    }
  }, [profile, session]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) return;
    
    setIsSaving(true);
    setApiError(null);

    try {
      const updatedProfile = await updateUserProfile(session.accessToken, {
        fullName: formData.fullName,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        department: formData.department,
        biography: formData.biography,
        avatarBase64: formData.avatarUrl && formData.avatarUrl.startsWith('data:image') ? formData.avatarUrl : undefined,
      });
      
      // If there was an existing avatar URL that is not a new base64 and wasn't changed, we might want to keep it if backend doesn't return it, but the backend maps it to avatarUrl.
      if (!formData.avatarUrl?.startsWith('data:image') && formData.avatarUrl) {
         updatedProfile.avatarUrl = formData.avatarUrl;
      }

      onSave(updatedProfile);
    } catch (error: any) {
      setApiError(error.message || 'Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Formato no soportado. Use: JPG, PNG, WEBP, etc.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo supera el límite de 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, avatarUrl: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">manage_accounts</span>
              Perfil de Usuario
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReturnHome}
                title="Volver a la página principal"
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 bg-white"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                session.role === 'ROLE_ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {session.role}
            </span>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-500">Foto de Perfil</label>
              
              <div className="flex items-center gap-6">
                <div 
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden shrink-0 group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(formData.fullName || 'User')
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div 
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                      isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      hidden 
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp" 
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-slate-400 text-2xl">cloud_upload</span>
                      <p className="text-sm font-medium text-slate-700">
                        Arrastra una imagen o haz clic
                      </p>
                      <p className="text-xs text-slate-500">
                        JPG, PNG, GIF, WEBP, SVG • Máx 5 MB
                      </p>
                    </div>
                  </div>
                  {uploadError && (
                    <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {uploadError}
                    </p>
                  )}
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="mt-2 text-xs text-rose-500 font-medium hover:text-rose-700 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      Eliminar foto actual
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre Completo <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Corporativo</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    readOnly
                    value={formData.email || ''}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
                    lock
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">El correo electrónico está vinculado a la cuenta y no se puede modificar.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Cargo / Puesto</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle || ''}
                    onChange={handleChange}
                    placeholder="Ej. Director Operativo"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Departamento</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleChange}
                  placeholder="Ej. Hospitality Operations"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Biografía / Notas</label>
                <textarea
                  name="biography"
                  value={formData.biography || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Breve descripción o notas adicionales..."
                />
              </div>
            </div>

            {apiError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                {apiError}
              </div>
            )}

          </form>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={isSaving}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/20 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
};
