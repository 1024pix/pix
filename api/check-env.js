import fs from 'fs/promises';
import url from 'url';

import dotenv from 'dotenv';

import { schema } from './env.schema.js';

const modulePath = url.fileURLToPath(import.meta.url);

const IS_LAUNCHED_FROM_CLI = process.argv[1] === modulePath;
const TIMER_LABEL = 'check-env';

/**
 * 1. Get file path from command arguments list
 * 2. Parse file with dotenv module
 */
async function main() {
  const envFilePath = process.argv[2];
  const fileData = await fs.readFile(envFilePath, { encoding: 'utf8' });
  const parseOutput = dotenv.parse(fileData);

  const { value, error, warning, artifacts } = await schema.validateAsync(parseOutput, { abortEarly: false, warnings: true, artifacts: true });

  console.log(error);
}

(async function () {
  if (!IS_LAUNCHED_FROM_CLI) return;

  console.time(TIMER_LABEL);

  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    console.timeEnd(TIMER_LABEL);
  }
})();
