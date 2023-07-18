import { formatMessageForSlack } from './slack.js';
import { countFilesInPath } from './stats.js';
import { getDoughnutChartUrl } from './quickcharts.js';

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
  const chartUrl = getDoughnutChartUrl(data);
  return console.log(formatMessageForSlack(chartUrl));
}

await main();

export { countFilesInPath };
