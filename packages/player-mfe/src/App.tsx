import MovieDetailPage from "./pages/MovieDetailPage";
import "./App.scss";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function App() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "STREAMIA - Reproductor de Video";
    console.log('[Player-MFE] Loaded with movie ID:', id);
  }, [id]);

  return (
    <div className="player-app">
      <MovieDetailPage />
    </div>
  );
}

export default App;

