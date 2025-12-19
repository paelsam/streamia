interface Props {
  count: number;
  onBack: () => void;
}

export default function CommentsHeader({ count, onBack }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
      <button
        className="movie-detail__back-button"
        style={{ color: "white", padding: "5px", fontSize: "16px", marginRight: "10px" }}
        onClick={onBack}
      >
        ←
      </button>

      <h2 className="movie-detail__comments-title" style={{ margin: 0 }}>
        Comentarios
        <span className="movie-detail__comments-count">({count})</span>
      </h2>
    </div>
  );
}
