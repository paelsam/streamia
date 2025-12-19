interface Props {
  value: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function CommentForm({ value, loading, onChange, onSubmit }: Props) {
  return (
    <div className="movie-detail__comment-form">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Comparte tu opinión sobre esta película..."
        className="movie-detail__comment-input"
        rows={4}
      />

      <button
        className="movie-detail__comment-submit"
        onClick={onSubmit}
        disabled={!value.trim() || loading}
      >
        Publicar comentario
      </button>
    </div>
  );
}
