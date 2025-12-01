import React from "react";

interface RatingStarsProps {
	rating: number;
	max?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, max = 5 }) => (
	<div className="rating-stars">
		{Array.from({ length: max }).map((_, i) => (
			<span key={i}>{i < rating ? "★" : "☆"}</span>
		))}
	</div>
);

export default RatingStars;
