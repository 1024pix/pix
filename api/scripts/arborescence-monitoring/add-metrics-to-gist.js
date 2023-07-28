import { readFile, writeFile } from 'fs/promises';
import { countFilesInPath } from './stats.js';

async function parseTimeSeriesMetrics({ metricsFilepath }) {
  const currentRawMetrics = await readFile(metricsFilepath, { encoding: 'utf-8' });
  return JSON.parse(currentRawMetrics);
}

function sortTimeSeriesMetrics(existingTimeSeriesMetrics) {
  return existingTimeSeriesMetrics.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
}

async function main() {
  const metricsFilepath = process.argv[2];
  const existingTimeSeriesMetrics = await parseTimeSeriesMetrics({ metricsFilepath });

  const updatedTimeSeriesMetrics = await _addOrUpdateTodayValue(existingTimeSeriesMetrics);
  const sortedTimeSeriesMetrics = sortTimeSeriesMetrics(updatedTimeSeriesMetrics);

  const stringifiedMetrics = JSON.stringify(sortedTimeSeriesMetrics);
  await writeFile(metricsFilepath, stringifiedMetrics);
}

async function _addOrUpdateTodayValue(existingTimeSeriesMetrics) {
  const usecasesCount = await countFilesInPath('./lib/domain/usecases');

  const todayIndex = _todayIndex(existingTimeSeriesMetrics);
  existingTimeSeriesMetrics.splice(todayIndex, _addOrUpdate(todayIndex), {
    x: new Date().toJSON(),
    y: usecasesCount,
  });
  return existingTimeSeriesMetrics;
}

function _todayIndex(existingTimeSeriesMetrics) {
  return existingTimeSeriesMetrics.findIndex(function (metric) {
    return _isSameDay(new Date(metric.x), new Date());
  });
}

function _isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
}

function _addOrUpdate(todayIndex) {
  return todayIndex >= 0 ? 1 : 0;
}

await main();

export { parseTimeSeriesMetrics };
