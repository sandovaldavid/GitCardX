#!/usr/bin/env node
/**
 * Minimal self-check for the GitCardX export path: asserts a given PNG
 * matches the official GitHub social-preview size (1280x640).
 *
 * Usage: node scripts/verify-export-dimensions.mjs <path-to-png>
 *
 * Reads only the PNG IHDR chunk (bytes 16-23), no dependency needed.
 */
import { readFileSync } from 'node:fs';

const EXPECTED_WIDTH = 1280;
const EXPECTED_HEIGHT = 640;

function getPngDimensions(filePath) {
	const buffer = readFileSync(filePath);
	const isPng = buffer.readUInt32BE(0) === 0x89504e47;
	if (!isPng) {
		throw new Error(`${filePath} is not a valid PNG file`);
	}
	const width = buffer.readUInt32BE(16);
	const height = buffer.readUInt32BE(20);
	return { width, height };
}

function main() {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error('Usage: node scripts/verify-export-dimensions.mjs <path-to-png>');
		process.exit(1);
	}

	const { width, height } = getPngDimensions(filePath);
	console.log(`Read dimensions: ${width}x${height}`);

	if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
		console.error(`FAIL: expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}, got ${width}x${height}`);
		process.exit(1);
	}

	console.log(`PASS: ${filePath} is exactly ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`);
}

main();
