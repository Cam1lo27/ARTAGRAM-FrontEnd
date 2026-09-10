import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../../lib/api';
import type { LikeResponse, PublicacionDto } from '../../types';

export function PostCard({ publicacion }: { publicacion: PublicacionDto }) {
  const [meGusta, setMeGusta] = useState(publicacion.meGusta);
  const [contador, setContador] = useState(publicacion.contadorLikes);
  const [animando, setAnimando] = useState(false);
  const [procesoAbierto, setProcesoAbierto] = useState(false);

  async function alternarLike() {
    const anteriorMeGusta = meGusta;
    const anteriorContador = contador;
    setMeGusta(!meGusta);
    setContador((c) => c + (meGusta ? -1 : 1));
    setAnimando(true);
    setTimeout(() => setAnimando(false), 350);
    try {
      const { data } = await api.post<LikeResponse>(`/api/publicaciones/${publicacion.id}/like`);
      setMeGusta(data.meGusta);
      setContador(data.contadorLikes);
    } catch {
      setMeGusta(anteriorMeGusta);
      setContador(anteriorContador);
    }
  }

  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 pt-4">
        <Link to={`/perfil/${publicacion.autorNombre}`} className="flex items-center gap-2 group">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-xs font-semibold uppercase">
            {publicacion.autorNombre.slice(0, 2)}
          </span>
          <span className="text-sm font-medium text-paper group-hover:text-coral">{publicacion.autorNombre}</span>
        </Link>
        <span className="text-xs text-paper-dim">
          {formatDistanceToNow(new Date(publicacion.creadoEn), { addSuffix: true, locale: es })}
        </span>
      </div>

      <div className="mt-3">
        <img src={publicacion.obraFinalUrl} alt={publicacion.titulo} className="max-h-[560px] w-full object-cover" loading="lazy" />
      </div>

      {publicacion.imagenesProcesoUrls.length > 0 && (
        <div className="border-t border-ink-800 px-5 py-3">
          <button
            onClick={() => setProcesoAbierto((v) => !v)}
            className="text-xs font-medium text-violet hover:underline"
          >
            {procesoAbierto ? 'Ocultar el proceso ▲' : `Ver el proceso (${publicacion.imagenesProcesoUrls.length}) ▼`}
          </button>
          {procesoAbierto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 flex gap-2 overflow-x-auto pb-1"
            >
              {publicacion.imagenesProcesoUrls.map((url, i) => (
                <img key={i} src={url} alt={`Paso ${i + 1}`} className="h-28 w-28 flex-shrink-0 rounded-lg object-cover" />
              ))}
            </motion.div>
          )}
        </div>
      )}

      <div className="px-5 py-4">
        <h3 className="font-display text-lg font-semibold">{publicacion.titulo}</h3>
        {publicacion.descripcion && <p className="mt-1 text-sm text-paper-muted">{publicacion.descripcion}</p>}
        {publicacion.etiquetas.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {publicacion.etiquetas.map((t) => (
              <span key={t} className="chip text-xs">
                #{t}
              </span>
            ))}
          </div>
        )}

        <button onClick={alternarLike} className="mt-4 flex items-center gap-2 text-sm">
          <motion.span
            animate={animando ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={meGusta ? 'text-coral' : 'text-paper-muted'}
          >
            {meGusta ? '♥' : '♡'}
          </motion.span>
          <span className={meGusta ? 'font-medium text-coral' : 'text-paper-muted'}>{contador}</span>
        </button>
      </div>
    </motion.article>
  );
}
