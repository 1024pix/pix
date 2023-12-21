import dotenv from 'dotenv';
// eslint-disable-next-line n/no-unpublished-import
import jsdocToMarkdown from 'jsdoc-to-markdown';
import * as url from 'url';
import { logger } from '../lib/infrastructure/logger.js';

dotenv.config();

async function main(baseFolder) {
  const docs = await jsdocToMarkdown.render({ files: `${baseFolder}/**/application/api/*.js` });

  console.log(docs);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main(process.argv[2]);
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  }
})();
