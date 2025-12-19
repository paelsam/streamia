import { useEffect, useState } from "react";
import { getComments, createComment } from "../api.ts";
import { useNavigate } from "react-router-dom";

// Estilos en la misma carpeta:
import "../styles/comments.scss";

// Componentes hermanos dentro de la misma carpeta
import CommentsHeader from "./CommentHeader";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentList";

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
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getComments(movieId).then(setComments).catch(console.error);
  }, [movieId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await createComment(movieId, newComment, token || "TEMP_TOKEN");
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

      <CommentsHeader
        count={comments.length}
        onBack={() => navigate(-1)}
      />

      <CommentForm
        value={newComment}
        loading={loading}
        onChange={setNewComment}
        onSubmit={handleAddComment}
      />

      <CommentsList comments={comments} />
    </section>
  );
}
