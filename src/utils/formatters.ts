/**
 * Formats integer counts into compact GitHub-style strings (e.g. 1200 -> "1.2k", 15400 -> "15.4k").
 */
export function formatCompactNumber(num: number): string {
	if (isNaN(num) || num <= 0) return '0';
	if (num < 1000) return String(num);

	if (num < 1_000_000) {
		const k = num / 1000;
		// If exact thousands or >= 100k, avoid decimal point (e.g. 100k, 10k)
		if (num >= 100_000 || Number.isInteger(k)) {
			return `${Math.floor(k)}k`;
		}
		return `${k.toFixed(1).replace(/\.0$/, '')}k`;
	}

	const m = num / 1_000_000;
	return `${m.toFixed(1).replace(/\.0$/, '')}M`;
}
