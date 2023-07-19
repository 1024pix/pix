import { generateChartUrl } from './quickcharts.js';

function _generateSankeyChartConfiguration(boundedContextDirectories) {
  const data = boundedContextDirectories.map(({ name, fileCount }) => ({
    from: 'src',
    to: name,
    flow: fileCount,
  }));

  return {
    type: 'sankey',
    data: {
      datasets: [
        {
          data,
          colorFrom: '#3d68ff',
          colorTo: '#ff9f00',
        },
      ],
    },
  };
}

function getSankeyChartUrl(boundedContextDirectories) {
  const sankeyConf = _generateSankeyChartConfiguration(boundedContextDirectories);
  return generateChartUrl(sankeyConf, 3);
}

export { getSankeyChartUrl };
