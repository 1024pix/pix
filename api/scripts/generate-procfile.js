import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { exit } from 'node:process';

if (!process.env.MADDO) exit(0);

await copyFile(resolve(import.meta.dirname, '../Procfile-maddo'), resolve(import.meta.dirname, '../Procfile'));
