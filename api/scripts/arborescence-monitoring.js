import { logger } from '../lib/infrastructure/logger.js';
import { readdir } from 'node:fs/promises';

async function countFilesInPath(path) {
  let fileNumber = 0;
  const files = await readdir(path, { recursive: true, withFileTypes: true });

  for await (const file of files) {
    if (file.isDirectory()) {
      const directoryFilesNumber = await countFilesInPath(`${path}/${file.name}`);
      fileNumber += directoryFilesNumber;
    } else if (file.isFile()) {
      fileNumber++;
    }
  }
  return fileNumber;
}

async function main() {
  const pathsToAnalyse = ['./lib', './src'];
  const result = await Promise.all(
    pathsToAnalyse.map(async (path) => ({
      path,
      count: await countFilesInPath(path),
    }))
  );

  logger.info(`Nb de fichiers dans lib: ${JSON.stringify(result)}`);
}

await main();

export { countFilesInPath };
