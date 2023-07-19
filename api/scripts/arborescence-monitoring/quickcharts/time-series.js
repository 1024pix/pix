import { generateChartUrl } from './quickcharts.js';

function getTimeSeriesChartUrl(data) {
  const timeseriesConf = _generateTimeSeriesChartConfiguration(data);
  return generateChartUrl(timeseriesConf, 2);
}

function _generateTimeSeriesChartConfiguration(data) {
  return {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Number of remaining usecases to migrate',
          fill: false,
          lineTension: 0.4,
          data,
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              displayFormats: {
                day: 'MMM DD YYYY',
              },
            },
          },
        ],
      },
    },
  };
}

export { getTimeSeriesChartUrl };
