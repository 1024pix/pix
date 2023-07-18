export function getDoughnutChartUrl(data) {
  const doughnutChartConfiguration = generateDoughnutChartConfiguration(data);
  return generateChartUrl(doughnutChartConfiguration, 2);
}

export function getSankeyChartUrl(boundedContextDirectories) {
  const sankeyConf = generateSankeyChartConfiguration(boundedContextDirectories);
  return generateChartUrl(sankeyConf, 3);
}

function generateDoughnutChartConfiguration(data) {
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

function generateSankeyChartConfiguration(boundedContextDirectories) {
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

function generateChartUrl(conf, version) {
  const backgroundColor = 'snow';
  const encodedChartConfiguration = encodeURIComponent(JSON.stringify(conf));
  return `https://quickchart.io/chart?c=${encodedChartConfiguration}&backgroundColor=${backgroundColor}&version=${version}`;
}
