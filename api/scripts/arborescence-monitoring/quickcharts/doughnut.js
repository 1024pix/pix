import { generateChartUrl } from './quickcharts.js';

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

function getDoughnutChartUrl(data) {
  const doughnutChartConfiguration = _generateDoughnutChartConfiguration(data);
  return generateChartUrl(doughnutChartConfiguration, 2);
}

export { getDoughnutChartUrl };
