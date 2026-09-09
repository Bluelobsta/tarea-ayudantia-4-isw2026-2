import { useEffect, useState } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState('');
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState(null);
  const [autor, setAutor] = useState('');
  const [calificacion, setCalificacion] = useState('5');
  const [comentario, setComentario] = useState('');
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

  const cargarComentarios = (animalId) => {
    setCargandoComentarios(true);
    setErrorComentarios(null);

    fetch(`${API_URL}/animals/${animalId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
        setCargandoComentarios(false);
      })
      .catch(() => {
        setErrorComentarios('No se pudieron cargar los comentarios');
        setCargandoComentarios(false);
      });
  };

  const seleccionarAnimal = (animal) => {
    setAnimalSeleccionado(animal);
    cargarComentarios(animal.id);
  };

  const crearComentario = async (event) => {
    event.preventDefault();
    setErrorComentarios(null);

    try {
      const respuesta = await fetch(
        `${API_URL}/animals/${animalSeleccionado.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            autor,
            calificacion: Number(calificacion),
            comentario,
          }),
        },
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setErrorComentarios(data.detalles?.[0]?.mensaje || data.error);
        return;
      }

      setComentario('');
      cargarComentarios(animalSeleccionado.id);
    } catch {
      setErrorComentarios('No se pudo enviar el comentario');
    }
  };

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
            <button type="button" onClick={() => seleccionarAnimal(animal)}>
              {animal.nombre}
            </button>
            {' — '}{animal.especie.nombre}, {animal.recinto.nombre}
          </li>
        ))}
      </ul>

      {animales.length === 0 && <p>No hay animales con esos filtros.</p>}

      {animalSeleccionado && (
        <div>
          <h3>Detalle de {animalSeleccionado.nombre}</h3>
          <p>Edad: {animalSeleccionado.edad} año(s)</p>
          <p>Peso: {animalSeleccionado.peso ?? 'Sin información'} kg</p>
          <p>Especie: {animalSeleccionado.especie.nombre}</p>
          <p>Recinto: {animalSeleccionado.recinto.nombre}</p>

          <h4>Comentarios</h4>
          {promedio !== null && <p>Promedio: {promedio.toFixed(1)} / 5</p>}
          {cargandoComentarios && <p>Cargando comentarios...</p>}
          {errorComentarios && <p>{errorComentarios}</p>}
          {!cargandoComentarios && comentarios.length === 0 && <p>No hay comentarios.</p>}
          <ul>
            {comentarios.map((item) => (
              <li key={item.id}>
                <strong>{item.autor} ({item.calificacion}/5):</strong>{' '}
                {item.comentario}
              </li>
            ))}
          </ul>

          <form onSubmit={crearComentario}>
            <h4>Agregar comentario</h4>
            <label>
              Autor:{' '}
              <input
                value={autor}
                onChange={(event) => setAutor(event.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Calificación:{' '}
              <select value={calificacion} onChange={(event) => setCalificacion(event.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>
            <br />
            <label>
              Comentario:{' '}
              <textarea
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
                required
              />
            </label>
            <br />
            <button type="submit">Publicar comentario</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AnimalCatalogo;
