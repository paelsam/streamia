import React from "react";

interface Subtitle {
	language: string;
	label: string;
	url: string;
}

interface SubtitleSelectorProps {
	subtitles: Subtitle[];
	selected: string;
	onChange: (lang: string) => void;
}

const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({ subtitles, selected, onChange }) => (
	<select value={selected} onChange={e => onChange(e.target.value)}>
		{subtitles.map(sub => (
			<option key={sub.language} value={sub.language}>{sub.label}</option>
		))}
	</select>
);

export default SubtitleSelector;
