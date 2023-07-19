import { generateChartUrl } from './quickcharts.js';

function getTimeSeriesChartUrl(data) {
  const timeseriesConf = _generateTimeSeriesChartConfiguration(data);
  return generateChartUrl(timeseriesConf, 2);
}

function _generateTimeSeriesChartConfiguration(data) {
  return {
    type: 'line',
    data: {
      datasets: [_historicalDataset(data), _endDateProjectionDataset(data)],
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
function _historicalDataset(data) {
  return {
    label: 'Number of remaining usecases to migrate',
    fill: false,
    borderWidth: 1.5,
    lineTension: 0.4,
    data,
  };
}

function _endDateProjectionDataset(data) {
  const previousData = data.slice(-1)[0];
  const projectionDate = _computeProjectionDate(data);
  let displayData = [previousData];
  if (projectionDate) {
    const projectionData = {
      x: projectionDate,
      y: 0,
    };
    displayData = [...displayData, projectionData];
  }
  return {
    label: 'Projection',
    fill: false,
    borderDash: [5, 5],
    borderWidth: 1,
    data: displayData,
  };
}

function _computeProjectionDate(data) {
  const firstIndex = Math.min(data.length - 10, 0);
  const firstDateTime = new Date(data.at(firstIndex).x).getTime();
  const lastDateTime = new Date(data.at(-1).x).getTime();
  const slope = (data.at(-1).y - data.at(firstIndex).y) / (lastDateTime - firstDateTime);

  if (slope >= 0) return undefined;

  return new Date(-(data.at(-1).y / slope) + new Date().getTime());
}

export { getTimeSeriesChartUrl };
