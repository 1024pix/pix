import { readFile, writeFile } from 'fs/promises';
import { countFilesInPath } from './stats.js';

async function main() {
  const metricsFile = process.argv[2];

  const currentRawMetrics = await readFile(metricsFile, { encoding: 'utf-8' });
  const currentMetrics = JSON.parse(currentRawMetrics);

  const usecasesCount = await countFilesInPath('./lib/domain/usecases');

  currentMetrics.push({
    x: new Date(),
    y: usecasesCount,
  });

  const stringifiedMetrics = JSON.stringify(currentMetrics);
  await writeFile(metricsFile, stringifiedMetrics);
}

await main();
