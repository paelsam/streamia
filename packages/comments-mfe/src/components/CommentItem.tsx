interface Comment {
  _id: string;
  text: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="movie-detail__comment">
      <div className="movie-detail__comment-header">
        <strong className="movie-detail__comment-username">
          {comment.userId.firstName} {comment.userId.lastName}
        </strong>

        <span className="movie-detail__comment-time">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="movie-detail__comment-text">{comment.text}</p>
    </div>
  );
}
