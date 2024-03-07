import { parseTimeSeriesMetrics } from './add-metrics-to-gist.js';
import { getDoughnutChartUrl } from './quickcharts/doughnut.js';
import { getSankeyChartUrl } from './quickcharts/sankey.js';
import { getTimeSeriesChartUrl } from './quickcharts/time-series.js';
import { formatMessageForSlack } from './slack.js';
import { boundedContextDirectories, countFilesInPath } from './stats.js';

async function main() {
  const doughnutChart = await _getDoughnut();
  const sankeyChart = await _getSankey();
  const timeSeriesChart = await _getTimeSeries({ metricsFilepath: process.argv[2] });

  return console.log(formatMessageForSlack([doughnutChart, sankeyChart, timeSeriesChart]));
}

async function _getDoughnut() {
  const pathsToAnalyse = ['./src', './lib'];
  const formattedDoughnutData = await Promise.all(
    pathsToAnalyse.map(async (path) => {
      const count = await countFilesInPath(path);
      return {
        path,
        count,
      };
    }),
  );
  const url = getDoughnutChartUrl(formattedDoughnutData);
  const altText = `🍩 ` + formattedDoughnutData.map(({ path, count }) => `${path}: ${count}`).join(', ');
  return { url, altText };
}

async function _getSankey() {
  const boundedContexts = await boundedContextDirectories();
  const url = getSankeyChartUrl(boundedContexts);
  const altText = '🍣 ' + boundedContexts.map((boundedContext) => boundedContext.toString()).join(', ');

  return { url, altText };
}

async function _getTimeSeries({ metricsFilepath }) {
  const url = getTimeSeriesChartUrl(await parseTimeSeriesMetrics({ metricsFilepath }));
  const altText = '📉 Nombre de usecases restants dans ./lib';
  return { url, altText };
}

await main();
