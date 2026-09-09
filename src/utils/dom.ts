/**
 * Small DOM helper still needed once components own their own markup:
 * batch-setting CSS custom properties on an element (defaults to :root).
 */
export function setCSSVariables(
	variables: Record<string, string | number>,
	element: HTMLElement = document.documentElement
): void {
	for (const [name, value] of Object.entries(variables)) {
		element.style.setProperty(name, String(value));
	}
}
