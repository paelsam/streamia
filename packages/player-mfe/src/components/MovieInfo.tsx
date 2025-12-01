import React from "react";

interface MovieInfoProps {
	title: string;
	year: number;
	category: string;
	description?: string;
	imageUrl?: string;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ title, year, category, description, imageUrl }) => (
	<div className="movie-info">
		{imageUrl && <img src={imageUrl} alt={title} className="movie-info__image" />}
		<div className="movie-info__details">
			<h2>{title} ({year})</h2>
			<p><strong>Categoría:</strong> {category}</p>
			{description && <p>{description}</p>}
		</div>
	</div>
);

export default MovieInfo;
