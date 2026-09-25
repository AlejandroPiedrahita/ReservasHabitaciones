import { UserProfile } from '../types';

const API_BASE = 'http://localhost:8080/api/v1';

export interface UpdateProfileRequestDto {
  fullName: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  biography?: string;
  avatarBase64?: string;
}

export const updateUserProfile = async (
  token: string,
  data: UpdateProfileRequestDto
): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/users/me/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el perfil');
  }

  const json = await response.json();
  
  return {
    userId: json.userId,
    email: json.email,
    fullName: json.fullName,
    phone: json.phone,
    jobTitle: json.jobTitle,
    department: json.department,
    biography: json.biography,
    avatarUrl: json.avatarBase64, // Mapping the Base64 response to avatarUrl in the frontend state
  };
};
