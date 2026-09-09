import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/especies`)
      .then((res) => res.json())
      .then((data) => setEspecies(data))
      .catch(() => setError('No se pudo conectar con el servidor'));

    fetch(`${API_URL}/recintos`)
      .then((res) => res.json())
      .then((data) => setRecintos(data))
      .catch(() => setError('No se pudo conectar con el servidor'));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (especieId) params.append('especieId', especieId);
    if (recintoId) params.append('recintoId', recintoId);

    fetch(`${API_URL}/animals?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo cargar el catálogo de animales');
        setCargando(false);
      });
  }, [especieId, recintoId]);

  if (cargando) return <p>Cargando animales...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Animales</h2>

      <label>
        Filtrar por especie:{' '}
        <select value={especieId} onChange={(event) => setEspecieId(event.target.value)}>
          <option value="">Todas</option>
          {especies.map((especie) => (
            <option key={especie.id} value={especie.id}>{especie.nombre}</option>
          ))}
        </select>
      </label>

      {' '}

      <label>
        Filtrar por recinto:{' '}
        <select value={recintoId} onChange={(event) => setRecintoId(event.target.value)}>
          <option value="">Todos</option>
          {recintos.map((recinto) => (
            <option key={recinto.id} value={recinto.id}>{recinto.nombre}</option>
          ))}
        </select>
      </label>

      <ul>
        {animales.map((animal) => (
          <li key={animal.id}>
            {animal.nombre} — {animal.especie.nombre}, {animal.recinto.nombre}
          </li>
        ))}
      </ul>

      {animales.length === 0 && <p>No hay animales con esos filtros.</p>}
    </div>
  );
}

export default AnimalCatalogo;
