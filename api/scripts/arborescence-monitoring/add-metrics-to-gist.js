import { readFile, writeFile } from 'fs/promises';
import { countFilesInPath } from './stats.js';
import { TimeSeries } from './time-series.js';

async function parseTimeSeriesMetrics({ metricsFilepath }) {
  const currentRawMetrics = await readFile(metricsFilepath, { encoding: 'utf-8' });
  return JSON.parse(currentRawMetrics);
}

async function main() {
  const metricsFilepath = process.argv[2];
  const existingTimeSeriesMetrics = await parseTimeSeriesMetrics({ metricsFilepath });

  let timeSeries = new TimeSeries(existingTimeSeriesMetrics);
  timeSeries = await _addOrUpdateTodayValue(timeSeries);
  await writeFile(metricsFilepath, timeSeries.toString());
}

async function _addOrUpdateTodayValue(timeSeries) {
  const usecasesCount = await countFilesInPath('./lib/domain/usecases');
  return timeSeries.add({
    x: new Date().toJSON(),
    y: usecasesCount,
  });
}

await main();

export { parseTimeSeriesMetrics };
