// src/middleware/visibilidad.js
// Helper para filtrar por visibilidad según autenticación

/**
 * Retorna el filtro de visibilidad para queries Prisma.
 * - Si el usuario tiene JWT (req.usuario existe): ve todo (sin filtro)
 * - Si usa clave pública (req.accesoPublico): solo ve 'publico'
 */
function filtroVisibilidad(req) {
  if (req.usuario) {
    return {}; // Autenticado con JWT: ve todo
  }
  return { visibilidad: 'publico' }; // Acceso público: solo públicos
}

module.exports = { filtroVisibilidad };
