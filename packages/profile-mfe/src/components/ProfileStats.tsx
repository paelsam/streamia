interface Props {
  stats?: {
    watched: number;
    favorites: number;
    reviews: number;
  };
}

export default function ProfileStats({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>{stats.watched}</h3>
        <p>Vistos</p>
      </div>
      <div className="stat-card">
        <h3>{stats.favorites}</h3>
        <p>Favoritos</p>
      </div>
      <div className="stat-card">
        <h3>{stats.reviews}</h3>
        <p>Reseñas</p>
      </div>
    </div>
  );
}
