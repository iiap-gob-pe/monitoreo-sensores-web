import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ paginaActual, totalPaginas, onChange, totalItems, porPagina }) {
  if (totalPaginas <= 1) return null;

  const paginas = [];
  const maxVisible = 5;
  let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
  let fin = Math.min(totalPaginas, inicio + maxVisible - 1);
  if (fin - inicio < maxVisible - 1) inicio = Math.max(1, fin - maxVisible + 1);

  for (let i = inicio; i <= fin; i++) paginas.push(i);

  const desde = (paginaActual - 1) * porPagina + 1;
  const hasta = Math.min(paginaActual * porPagina, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-xs text-gray-500">
        Mostrando {desde}-{hasta} de {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(paginaActual - 1)}
          disabled={paginaActual <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        {inicio > 1 && (
          <>
            <button onClick={() => onChange(1)} className="px-3 py-1 text-xs rounded-lg hover:bg-gray-100">1</button>
            {inicio > 2 && <span className="text-gray-400 text-xs">...</span>}
          </>
        )}
        {paginas.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              p === paginaActual ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
        {fin < totalPaginas && (
          <>
            {fin < totalPaginas - 1 && <span className="text-gray-400 text-xs">...</span>}
            <button onClick={() => onChange(totalPaginas)} className="px-3 py-1 text-xs rounded-lg hover:bg-gray-100">{totalPaginas}</button>
          </>
        )}
        <button
          onClick={() => onChange(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
