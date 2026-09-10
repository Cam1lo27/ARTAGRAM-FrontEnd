import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../ui/Button';

const enlaces = [
  { a: '/feed', texto: 'Feed' },
  { a: '/comunidades', texto: 'Comunidades' },
  { a: '/fiesta', texto: 'Modo fiesta' },
  { a: '/mensajes', texto: 'Mensajes' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const sesion = useAuthStore((s) => s.sesion);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const navigate = useNavigate();
  const enlacesVisibles = sesion?.rolGlobal === 'ADMIN' ? [...enlaces, { a: '/admin', texto: 'Admin' }] : enlaces;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink-950/35 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/feed" className="flex items-center gap-2 group">
            <img
              src="/favicon.svg"
              alt="Artagram"
              className="h-8 w-8 transition-transform group-hover:scale-105"
            />
            <span className="font-display text-lg font-semibold tracking-tight">Artagram</span>
          </Link>

          {sesion && (
            <nav className="hidden items-center gap-1 md:flex">
              {enlacesVisibles.map((e) => (
                <Link
                  key={e.a}
                  to={e.a}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-paper-muted transition-colors hover:bg-ink-800 hover:text-paper"
                >
                  {e.texto}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {sesion ? (
              <>
                <Link
                  to={`/perfil/${sesion.nombreArtista}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-paper-muted hover:bg-ink-800 hover:text-paper"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-700 text-xs font-semibold uppercase">
                    {sesion.nombreArtista.slice(0, 2)}
                  </span>
                  <span className="hidden sm:inline">{sesion.nombreArtista}</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    cerrarSesion();
                    navigate('/login');
                  }}
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Entrar
                </Link>
                <Link to="/registro" className="btn-primary">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
        {sesion && (
          <nav className="flex gap-1 overflow-x-auto border-t border-ink-800 px-2 py-1.5 md:hidden">
            {enlaces.map((e) => (
              <Link key={e.a} to={e.a} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-paper-muted hover:bg-ink-800">
                {e.texto}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
