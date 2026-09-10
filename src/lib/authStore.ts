import { create } from 'zustand';

export interface SesionUsuario {
  accessToken: string;
  usuarioId: string;
  nombreArtista: string;
  rolGlobal: string;
  premium: boolean;
}

interface AuthState {
  sesion: SesionUsuario | null;
  iniciarSesion: (sesion: SesionUsuario) => void;
  cerrarSesion: () => void;
}

const CLAVE_STORAGE = 'artagram.sesion';

function cargarSesionInicial(): SesionUsuario | null {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    return crudo ? (JSON.parse(crudo) as SesionUsuario) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  sesion: cargarSesionInicial(),
  iniciarSesion: (sesion) => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion));
    set({ sesion });
  },
  cerrarSesion: () => {
    localStorage.removeItem(CLAVE_STORAGE);
    set({ sesion: null });
  },
}));

export function obtenerTokenActual(): string | null {
  return useAuthStore.getState().sesion?.accessToken ?? null;
}
