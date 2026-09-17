import assert from 'node:assert/strict';
import { formatCompactNumber } from '../src/utils/formatters.ts';

assert.equal(formatCompactNumber(0), '0');
assert.equal(formatCompactNumber(42), '42');
assert.equal(formatCompactNumber(999), '999');
assert.equal(formatCompactNumber(1000), '1k');
assert.equal(formatCompactNumber(1240), '1.2k');
assert.equal(formatCompactNumber(10500), '10.5k');
assert.equal(formatCompactNumber(100000), '100k');
assert.equal(formatCompactNumber(1500000), '1.5M');
console.log('✓ formatCompactNumber tests passed successfully.');
