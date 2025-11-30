import CommentItem from "./CommentItem";

interface Comment {
  _id: string;
  text: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function CommentsList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return <p>No hay comentarios aún</p>;

  return (
    <div className="movie-detail__comments-list">
      {comments.map((c) => (
        <CommentItem key={c._id} comment={c} />
      ))}
    </div>
  );
}
