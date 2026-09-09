/**
 * GitHub linguist language colors, used to color the language-composition
 * bar on the card (mirrors the bar GitHub's own social-preview card shows).
 */
export const LANGUAGE_COLORS: Record<string, string> = {
	JavaScript: '#f1e05a',
	TypeScript: '#3178c6',
	Python: '#3572A5',
	Java: '#b07219',
	'C++': '#f34b7d',
	C: '#555555',
	'C#': '#7355dd',
	Go: '#00ADD8',
	Rust: '#CE422B',
	Ruby: '#701516',
	PHP: '#777BB4',
	Swift: '#FA7343',
	Kotlin: '#A97BFF',
	HTML: '#e34c26',
	CSS: '#663399',
	SCSS: '#c6538c',
	Shell: '#89e051',
	Dart: '#00B4AB',
	Vue: '#41b883',
	Scala: '#DC322F',
	R: '#198CE7',
	'Objective-C': '#438eff',
	Perl: '#0298c3',
	Lua: '#000080',
	Haskell: '#5e5086',
	Elixir: '#6e4a7e',
	Clojure: '#db5855',
	MATLAB: '#e16737',
	'Jupyter Notebook': '#DA5B0B',
	Dockerfile: '#384d54',
	Makefile: '#427819',
	TeX: '#3D6117',
	PowerShell: '#012456',
	Assembly: '#6E4C13',
	'F#': '#b845fc',
	OCaml: '#ef7a08',
	Julia: '#a270ba',
	CoffeeScript: '#244776',
	Groovy: '#4298b8',
	Solidity: '#AA6746',
	Zig: '#ec915c',
	Nim: '#ffc200',
	Astro: '#ff5a03',
	Svelte: '#ff3e00',
	'Vim Script': '#199f4b',
	Elm: '#60B5CC',
};

/** Fallback color for languages not in LANGUAGE_COLORS (matches --label-color). */
export const UNKNOWN_LANGUAGE_COLOR = '#8b96a3';

export function getLanguageColor(name: string): string {
	return LANGUAGE_COLORS[name] ?? UNKNOWN_LANGUAGE_COLOR;
}
