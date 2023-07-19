import { formatMessageForSlack } from './slack.js';
import { boundedContextDirectories, countFilesInPath } from './stats.js';
import { parseTimeSeriesMetrics } from './add-metrics-to-gist.js';
import { getTimeSeriesChartUrl } from './quickcharts/time-series.js';
import { getSankeyChartUrl } from './quickcharts/sankey.js';
import { getDoughnutChartUrl } from './quickcharts/doughnut.js';

async function main() {
  const doughnutChartUrl = await _getDoughnut();
  const sankeyChartUrl = await _getSankey();
  const timeseriesChartUrl = await _getTimeSeries({ metricsFilepath: process.argv[2] });

  return console.log(formatMessageForSlack([doughnutChartUrl, sankeyChartUrl, timeseriesChartUrl]));
}

await main();

export { countFilesInPath };

function _formatResult({ path, count }) {
  return {
    path,
    count,
  };
}

async function _getDoughnut() {
  const pathsToAnalyse = ['./src', './lib'];
  const result = await Promise.all(
    pathsToAnalyse.map(async (path) => {
      const count = await countFilesInPath(path);
      return _formatResult({ path, count });
    })
  );
  const data = result.map(({ count }) => count);
  return getDoughnutChartUrl(data);
}

async function _getSankey() {
  const boundedContexts = await boundedContextDirectories();
  const sankeyChartUrl = getSankeyChartUrl(boundedContexts);
  return sankeyChartUrl;
}

async function _getTimeSeries({ metricsFilepath }) {
  const timeseriesChartUrl = getTimeSeriesChartUrl(await parseTimeSeriesMetrics({ metricsFilepath }));
  return timeseriesChartUrl;
}
