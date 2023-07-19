function _generateTimeSeriesChartConfiguration(data) {
  return {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Number of remaining usecases to migrate',
          fill: false,
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

function _generateDoughnutChartConfiguration(data) {
  return {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data,
          backgroundColor: ['green', '#eee'],
          label: 'Dataset 1',
          borderWidth: 0,
        },
      ],
      labels: ['src', 'lib'],
    },
    options: {
      circumference: Math.PI,
      rotation: Math.PI,
      cutoutPercentage: 90,
      layout: {
        padding: 60,
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      plugins: {
        datalabels: {
          color: '#404040',
          anchor: 'end',
          align: 'end',
          font: {
            size: 25,
            weight: 'bold',
          },
        },
        doughnutlabel: {
          labels: [
            {
              text: `branch`,
              font: {
                size: 18,
              },
            },
            {
              text: process.env.BRANCH_NAME || 'unknown',
              font: {
                size: 14,
              },
            },
            {
              text: '\n\nmigration progress',
              color: '#000',
              font: {
                size: 22,
                weight: 'bold',
              },
            },
          ],
        },
      },
    },
  };
}

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

function getDoughnutChartUrl(data) {
  const doughnutChartConfiguration = _generateDoughnutChartConfiguration(data);
  return generateChartUrl(doughnutChartConfiguration, 2);
}

function getSankeyChartUrl(boundedContextDirectories) {
  const sankeyConf = _generateSankeyChartConfiguration(boundedContextDirectories);
  return generateChartUrl(sankeyConf, 3);
}

function getTimeSeriesChartUrl(data) {
  const timeseriesConf = _generateTimeSeriesChartConfiguration(data);
  return generateChartUrl(timeseriesConf, 2);
}

function generateChartUrl(conf, version) {
  const backgroundColor = 'snow';
  const encodedChartConfiguration = encodeURIComponent(JSON.stringify(conf));
  return `https://quickchart.io/chart?c=${encodedChartConfiguration}&backgroundColor=${backgroundColor}&version=${version}`;
}

export { getDoughnutChartUrl, getSankeyChartUrl, getTimeSeriesChartUrl };
