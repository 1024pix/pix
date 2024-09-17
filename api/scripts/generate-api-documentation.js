import 'dotenv/config';

import * as url from 'node:url';

import jsdocToMarkdown from 'jsdoc-to-markdown';

import { executeScript } from './tooling/tooling.js';

async function main(baseFolder) {
  const docs = await jsdocToMarkdown.render({ files: `${baseFolder}/**/application/api/**/*.js` });

  console.log(docs);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    const mainWithArgs = main.bind(this, process.argv[2]);
    await executeScript({ processArgvs: process.argv, scriptFn: mainWithArgs });
  }
})();
