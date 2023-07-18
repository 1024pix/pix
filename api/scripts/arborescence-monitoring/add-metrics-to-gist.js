import { readFile, writeFile } from 'fs/promises';
import { countFilesInPath } from './stats.js';

async function parseTimeSeriesMetrics({ metricsFilepath }) {
  const currentRawMetrics = await readFile(metricsFilepath, { encoding: 'utf-8' });
  return JSON.parse(currentRawMetrics);
}

async function main() {
  const metricsFilepath = process.argv[2];

  const currentRawMetrics = await parseTimeSeriesMetrics({ metricsFilepath });

  const usecasesCount = await countFilesInPath('./lib/domain/usecases');

  currentRawMetrics.push({
    x: new Date(),
    y: usecasesCount,
  });

  const stringifiedMetrics = JSON.stringify(currentRawMetrics);
  await writeFile(metricsFilepath, stringifiedMetrics);
}

await main();

export { parseTimeSeriesMetrics };
