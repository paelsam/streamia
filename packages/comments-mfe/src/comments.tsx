import { useEffect, useState } from "react";
import { getComments, createComment } from "./api";

interface Comment {
  _id: string;
  text: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
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


  return (
    <div>
      <h3>Comentarios</h3>

      {comments.map((c) => (
        <div key={c._id}>
          <strong>
            {c.userId.firstName} {c.userId.lastName}
          </strong>
          <p>{c.text}</p>
        </div>
      ))}

      {token && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleSubmit}>Comentar</button>
        </>
      )}
    </div>
  );
}
