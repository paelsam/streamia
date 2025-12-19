import { API_URL } from '@streamia/shared/config';

const COMMENTS_API_URL = `${API_URL}/comments`;

// Obtener comentarios por película
export async function getComments(movieId: string) {
  const res = await fetch(`${COMMENTS_API_URL}/${movieId}`);

  if (!res.ok) {
    throw new Error("Error cargando comentarios");
  }

  return res.json();
}

// Crear comentario
export async function createComment(
  movieId: string,
  text: string,
  token: string
) {
  const res = await fetch(COMMENTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movieId, text }),
  });

  if (!res.ok) {
    throw new Error("Error creando comentario");
  }

  return res.json();
}

// Actualizar comentario
export async function updateComment(id: string, text: string, token: string) {
  const res = await fetch(`${COMMENTS_API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("Error al actualizar comentario");
  return res.json();
}

// Eliminar comentario
export async function deleteComment(id: string, token: string) {
  const res = await fetch(`${COMMENTS_API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Error al eliminar comentario");
  return res.json();
}
