// src/hooks/usePreferencias.js
import { useState, useEffect } from 'react';

const defaultPreferencias = {
  zonaHoraria: 'America/Lima',
  formatoFecha: 'DD/MM/YYYY',
  intervaloActualizacion: 30,
  registrosPorPagina: 20,
  mostrarGraficos: true,
  animacionesGraficos: true
};

export const usePreferencias = () => {
  const [preferencias, setPreferencias] = useState(defaultPreferencias);

  useEffect(() => {
    const configGuardada = localStorage.getItem('preferencias_sistema');
    console.log('🔍 Cargando preferencias desde localStorage:', configGuardada); // ✅ Debug
    
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada);
        console.log('✅ Preferencias parseadas:', config); // ✅ Debug
        setPreferencias({ ...defaultPreferencias, ...config });
      } catch (error) {
        console.error('❌ Error al cargar preferencias:', error);
        setPreferencias(defaultPreferencias);
      }
    }
  }, []);

  // Formatear fecha según preferencia
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    switch (preferencias.formatoFecha) {
      case 'DD/MM/YYYY':
        return `${dia}/${mes}/${anio}`;
      case 'MM/DD/YYYY':
        return `${mes}/${dia}/${anio}`;
      case 'YYYY-MM-DD':
        return `${anio}-${mes}-${dia}`;
      default:
        return `${dia}/${mes}/${anio}`;
    }
  };

  // Formatear fecha y hora completa
  const formatearFechaHora = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const fechaFormateada = formatearFecha(fecha);
    const hora = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    
    return `${fechaFormateada} ${hora}:${minutos}:${segundos}`;
  };

  // Formatear solo hora
  const formatearHora = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) return 'Hora inválida';
    
    const hora = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    
    return `${hora}:${minutos}`;
  };

  console.log('📊 Preferencias actuales en hook:', preferencias); // ✅ Debug

  return {
    preferencias,
    formatearFecha,
    formatearFechaHora,
    formatearHora
  };
};