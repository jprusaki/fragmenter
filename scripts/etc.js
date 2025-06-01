import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const etc = join(__dirname, '../etc');

try {
	if (!existsSync(etc)) {
		mkdirSync(etc);
	}
} catch (error) {
	console.error('Postinstall: Failed creating "etc" folder.');
	console.error(error);
	process.exit(1);
}
