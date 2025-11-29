import { useEffect, useState } from "react";
import { getComments, createComment } from "./api";
import "./styles/comments.scss";


interface Comment {
  _id: string;
  text: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface CommentsProps {
  movieId: string;
  token?: string;
}

export default function Comments({ movieId, token }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    getComments(movieId).then(setComments).catch(console.error);
  }, [movieId]);

  const handleSubmit = async () => {
    if (!token || !text.trim()) return;

    try {
      await createComment(movieId, text, token);
      const updated = await getComments(movieId);
      setComments(updated);
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = "Usuario Test";

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);

      await createComment(
        movieId,
        newComment,
        token || "TEMP_TOKEN"
      );

      setNewComment("");

      const updated = await getComments(movieId);
      setComments(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };




  return (
    <section className="movie-detail__comments">
      <h2 className="movie-detail__comments-title">
        Comentarios
        <span className="movie-detail__comments-count">({comments.length})</span>
      </h2>

      {/* FORM */}
      <div className="movie-detail__comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Comparte tu opinión sobre esta película..."
          className="movie-detail__comment-input"
          rows={4}
        />

        <button
          className="movie-detail__comment-submit"
          onClick={handleAddComment}
          disabled={!newComment.trim() || loading}
        >
          Publicar comentario
        </button>
      </div>

      {/* LISTA */}
      <div className="movie-detail__comments-list">
        {comments.length === 0 ? (
          <p>No hay comentarios aún</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="movie-detail__comment">
              <div className="movie-detail__comment-header">
                <strong className="movie-detail__comment-username">
                  {c.userId.firstName} {c.userId.lastName}
                </strong>
                <span className="movie-detail__comment-time">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="movie-detail__comment-text">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </section>

  );
}