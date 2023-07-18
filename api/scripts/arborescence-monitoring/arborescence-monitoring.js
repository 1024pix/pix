import { formatMessageForSlack } from './slack.js';
import { boundedContextDirectories, countFilesInPath } from './stats.js';
import { getDoughnutChartUrl, getSankeyChartUrl } from './quickcharts.js';

function formatResult({ path, count }) {
  return {
    path,
    count,
  };
}

async function main() {
  const pathsToAnalyse = ['./src', './lib'];
  const result = await Promise.all(
    pathsToAnalyse.map(async (path) => {
      const count = await countFilesInPath(path);
      return formatResult({ path, count });
    })
  );
  const data = result.map(({ count }) => count);
  const boundedContexts = await boundedContextDirectories();
  const doughnutChartUrl = getDoughnutChartUrl(data);
  const sankeyChartUrl = getSankeyChartUrl(boundedContexts);
  return console.log(formatMessageForSlack([doughnutChartUrl, sankeyChartUrl]));
}

await main();

export { countFilesInPath };
