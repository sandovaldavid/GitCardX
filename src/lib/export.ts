import html2canvas from 'html2canvas';
import { ANIMATION_DELAY_MS } from '../constants/defaults';
import { CARD_EXPORT } from '../constants/card-dimensions';

/**
 * Exports the card identified by `cardId` to a downloaded PNG at the
 * official 1280x640 GitHub social-preview size.
 *
 * Uses 2x supersampling (SSAA) and high-quality bicubic downscaling
 * to eliminate fuzzy text and jagged vector curves from html2canvas.
 */
export async function exportToPNG(cardId: string): Promise<void> {
	const canvas = await renderCardToCanvas(cardId);
	downloadImage(canvas);
}

/**
 * Copies the card image directly to the system clipboard as PNG.
 * Compatible with Safari/WebKit user-activation constraints.
 */
export async function copyCardToClipboard(cardId: string): Promise<void> {
	if (!navigator.clipboard || !navigator.clipboard.write) {
		throw new Error('Clipboard API not supported in this browser environment');
	}

	const blobPromise = (async () => {
		const canvas = await renderCardToCanvas(cardId);
		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
		if (!blob) throw new Error('Failed to generate image blob');
		return blob;
	})();

	await navigator.clipboard.write([
		new ClipboardItem({ 'image/png': blobPromise }),
	]);
}

/**
 * Renders the canonical 1280x640 card to a crisp, high-fidelity canvas.
 * Because the preview and export share the identical 1280x640 DOM & CSS layout
 * (preview uses CSS transform: scale to fit screen), the exported image is
 * 100% identical in proportions, fonts, and spacing to the on-screen preview.
 */
export async function renderCardToCanvas(cardId: string): Promise<HTMLCanvasElement> {
	const card = document.getElementById(cardId);
	if (!card) {
		throw new Error('Card element not found');
	}

	// Ensure all webfonts (Manrope, JetBrains Mono) are completely decoded before rasterization
	if (document.fonts && document.fonts.ready) {
		await document.fonts.ready;
	}

	const wrapper = document.createElement('div');
	Object.assign(wrapper.style, {
		position: 'fixed',
		top: '-9999px',
		left: '-9999px',
		width: `${CARD_EXPORT.WIDTH}px`,
		height: `${CARD_EXPORT.HEIGHT}px`,
		overflow: 'hidden',
		zIndex: '-9999',
		boxSizing: 'border-box',
		backgroundColor: 'transparent',
	});

	// Clone the card directly — it carries all classes, styles, and scoped attributes
	const clone = card.cloneNode(true) as HTMLElement;

	// Reset the preview scale transform so it renders at 100% canonical 1280x640 size
	Object.assign(clone.style, {
		transform: 'none',
		position: 'relative',
		top: '0',
		left: '0',
		width: `${CARD_EXPORT.WIDTH}px`,
		height: `${CARD_EXPORT.HEIGHT}px`,
		maxWidth: 'none',
		margin: '0',
		boxShadow: 'none',
	});

	wrapper.appendChild(clone);
	document.body.appendChild(wrapper);

	try {
		await new Promise((resolve) => setTimeout(resolve, ANIMATION_DELAY_MS));

		// Render with 2x scale for Retina / high-DPI supersampling
		const hiresCanvas = await html2canvas(wrapper, {
			scale: 2,
			backgroundColor: null,
			logging: false,
			useCORS: true,
			allowTaint: true,
			width: CARD_EXPORT.WIDTH,
			height: CARD_EXPORT.HEIGHT,
		});

		// High-quality downsampling to exact 1280x640 (Supersample Anti-Aliasing)
		const finalCanvas = document.createElement('canvas');
		finalCanvas.width = CARD_EXPORT.WIDTH;
		finalCanvas.height = CARD_EXPORT.HEIGHT;
		const ctx = finalCanvas.getContext('2d');
		if (!ctx) {
			return hiresCanvas;
		}

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(hiresCanvas, 0, 0, CARD_EXPORT.WIDTH, CARD_EXPORT.HEIGHT);

		return finalCanvas;
	} finally {
		if (wrapper.parentNode) {
			document.body.removeChild(wrapper);
		}
	}
}

function downloadImage(canvas: HTMLCanvasElement): void {
	try {
		const link = document.createElement('a');
		link.download = 'github-project-card.png';
		link.href = canvas.toDataURL('image/png');
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error('Error downloading image:', error);
		throw new Error(`Failed to download image. ${error instanceof Error ? error.message : String(error)}`);
	}
}
