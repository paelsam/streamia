import React from "react";

interface RatingWidgetProps {
	value: number;
	max?: number;
	onRate: (value: number) => void;
}

const RatingWidget: React.FC<RatingWidgetProps> = ({ value, max = 5, onRate }) => (
	<div className="rating-widget">
		{Array.from({ length: max }).map((_, i) => (
			<span
				key={i}
				style={{ cursor: "pointer", color: i < value ? "gold" : "gray" }}
				onClick={() => onRate(i + 1)}
			>
				★
			</span>
		))}
	</div>
);

export default RatingWidget;
