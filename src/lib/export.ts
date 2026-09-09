import html2canvas from 'html2canvas';
import { ANIMATION_DELAY_MS } from '../constants/defaults';
import { ASSET_SIZES, CARD_EXPORT, EXPORT_TEXT_SIZES } from '../constants/card-dimensions';

const TEMP_EXPORT_STYLE_ID = 'temp-export-styles';

/**
 * Exports the card identified by `cardId` to a downloaded PNG at the
 * official 1280x640 GitHub social-preview size, by cloning it into an
 * offscreen wrapper sized exactly to CARD_EXPORT and rendering with
 * html2canvas.
 */
export async function exportToPNG(cardId: string): Promise<void> {
	const card = document.getElementById(cardId);
	if (!card) {
		throw new Error('Card element not found');
	}

	const wrapper = createExportWrapper();
	const clone = prepareCardForExport(card);
	wrapper.appendChild(clone);
	document.body.appendChild(wrapper);

	try {
		await new Promise((resolve) => setTimeout(resolve, ANIMATION_DELAY_MS));

		const canvas = await html2canvas(wrapper, {
			scale: 1,
			backgroundColor: null,
			logging: false,
			useCORS: true,
			allowTaint: true,
			width: CARD_EXPORT.WIDTH,
			height: CARD_EXPORT.HEIGHT,
			onclone: (clonedDoc: Document) => {
				const clonedWrapper = clonedDoc.querySelector<HTMLElement>('[style*="fixed"]');
				if (clonedWrapper) {
					const borderColor = getComputedStyle(document.documentElement)
						.getPropertyValue('--border-color')
						.trim();
					clonedWrapper.style.borderBottom = `3rem solid ${borderColor}`;
				}
			},
		});

		downloadImage(canvas);
	} finally {
		if (wrapper.parentNode) {
			document.body.removeChild(wrapper);
		}
		removeTemporaryStyles();
	}
}

function createExportWrapper(): HTMLDivElement {
	const wrapper = document.createElement('div');

	Object.assign(wrapper.style, {
		position: 'fixed',
		top: '-9999px',
		left: '-9999px',
		width: `${CARD_EXPORT.WIDTH}px`,
		height: `${CARD_EXPORT.HEIGHT}px`,
		overflow: 'hidden',
		zIndex: '-1',
		boxSizing: 'border-box',
	});

	const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
	const borderColor = getComputedStyle(document.documentElement)
		.getPropertyValue('--border-color')
		.trim();

	wrapper.style.backgroundColor = bgColor;
	wrapper.style.borderBottom = `3rem solid ${borderColor}`;

	return wrapper;
}

function prepareCardForExport(originalCard: HTMLElement): HTMLElement {
	const clone = originalCard.cloneNode(true) as HTMLElement;

	Object.assign(clone.style, {
		width: '100%',
		height: '100%',
		maxWidth: 'none',
		margin: '0',
		padding: '40pt 40pt 0 40pt',
		boxShadow: 'none',
		position: 'relative',
	});

	copyComputedStyles(originalCard, clone);
	scaleCardElements(clone);

	return clone;
}

function copyComputedStyles(source: HTMLElement, target: HTMLElement): void {
	const styles = window.getComputedStyle(source);

	target.style.backgroundColor = styles.backgroundColor;

	if (styles.backgroundImage !== 'none') {
		target.style.backgroundImage = styles.backgroundImage;
		target.style.backgroundSize = 'cover';
		target.style.backgroundPosition = 'center';
		target.style.backgroundRepeat = 'no-repeat';

		if (source.classList.contains('has-bg-image')) {
			target.classList.add('has-bg-image');
			addDarkOverlayStyle();
		}
	}
}

function addDarkOverlayStyle(): void {
	if (document.getElementById(TEMP_EXPORT_STYLE_ID)) return;

	const style = document.createElement('style');
	style.id = TEMP_EXPORT_STYLE_ID;
	style.textContent = `
		.has-bg-image::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.6);
			z-index: 1;
			pointer-events: none;
		}
	`;
	document.head.appendChild(style);
}

function scaleCardElements(card: HTMLElement): void {
	const header = card.querySelector<HTMLElement>('.card-header');
	if (header) {
		Object.assign(header.style, { zIndex: '2', padding: '30px', height: '120px', minHeight: '120px' });
	}

	const body = card.querySelector<HTMLElement>('.card-body');
	if (body) {
		Object.assign(body.style, { zIndex: '2', padding: '30px' });
	}

	const footer = card.querySelector<HTMLElement>('.card-footer');
	if (footer) {
		Object.assign(footer.style, {
			zIndex: '2',
			padding: '0 30px 30px',
			minHeight: '100px',
		});
	}

	const textElements: Record<string, { selector: string; fontSizeRem: number; lineHeight?: number }> = {
		repoName: { selector: '#displayRepoName', ...EXPORT_TEXT_SIZES.repoName },
		username: { selector: '#displayUsername', ...EXPORT_TEXT_SIZES.username },
		description: { selector: '#displayDescription', ...EXPORT_TEXT_SIZES.description },
		starCount: { selector: '#displayStarCount', ...EXPORT_TEXT_SIZES.statCount },
		forkCount: { selector: '#displayForkCount', ...EXPORT_TEXT_SIZES.statCount },
	};

	for (const config of Object.values(textElements)) {
		const element = card.querySelector<HTMLElement>(config.selector);
		if (element) {
			element.style.fontSize = `${config.fontSizeRem}rem`;
			if (config.lineHeight) {
				element.style.lineHeight = `${config.lineHeight}`;
			}
		}
	}

	const profilePic = card.querySelector<HTMLElement>('.profile-pic');
	if (profilePic) {
		profilePic.style.width = `${ASSET_SIZES.profilePic.export}px`;
		profilePic.style.height = `${ASSET_SIZES.profilePic.export}px`;
	}

	const statIcons = card.querySelectorAll<HTMLElement>('.stat-chip i');
	statIcons.forEach((icon) => {
		icon.style.fontSize = `${ASSET_SIZES.statIcon.export}px`;
	});

	const languageBar = card.querySelector<HTMLElement>('.language-bar');
	if (languageBar) {
		languageBar.style.height = `${ASSET_SIZES.languageBar.export}px`;
		// The .language-bar CSS rule's negative margin (-25px) compensates for
		// the PREVIEW card's 25px padding so the bar reaches the true edges.
		// The export clone's own padding is overridden above to 40pt/40pt/0/40pt
		// (see prepareCardForExport), so that same -25px would under-compensate
		// left/right and over-shoot the now-zero bottom padding. Override both
		// inline to match the clone's actual padding instead.
		languageBar.style.margin = '0 -40pt 0';
		languageBar.style.width = 'calc(100% + 80pt)';
	}

	const projectLogo = card.querySelector<HTMLElement>('.project-logo');
	if (projectLogo) {
		projectLogo.style.width = 'auto';
		projectLogo.style.height = '4rem';
		projectLogo.style.borderRadius = '10px';
	}

	const logoContainer = card.querySelector<HTMLElement>('.logo-container');
	if (logoContainer) {
		Object.assign(logoContainer.style, {
			zIndex: '2',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			maxHeight: '5rem',
		});
	}
}

function removeTemporaryStyles(): void {
	const tempStyles = document.getElementById(TEMP_EXPORT_STYLE_ID);
	if (tempStyles?.parentNode) {
		tempStyles.parentNode.removeChild(tempStyles);
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
