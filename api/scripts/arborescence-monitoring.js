import { readdir } from 'node:fs/promises';

async function countFilesInPath(path) {
  let fileNumber = 0;
  const files = await readdir(path, { recursive: true, withFileTypes: true });

  for await (const file of files) {
    if (file.isDirectory()) {
      const directoryFilesNumber = await countFilesInPath(`${path}/${file.name}`);
      fileNumber += directoryFilesNumber;
    } else if (file.isFile()) {
      fileNumber++;
    }
  }
  return fileNumber;
}

function formatResult({ path, count }) {
  return {
    path,
    count,
  };
}

function _formatMessageForSlack(image_url) {
  const slackBlocks = {
    blocks: [
      {
        type: 'image',
        image_url,
        alt_text: 'inspiration',
      },
    ],
  };
  return JSON.stringify(slackBlocks);
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
  return console.log(_formatMessageForSlack(chartUrl));
}

function getDoughnutChartUrl(data) {
  const backgroundColor = 'snow';
  const doughnutChartConfiguration = generateDoughnutChartConfiguration(data);
  const encodedChartConfiguration = encodeURIComponent(JSON.stringify(doughnutChartConfiguration));
  return `https://quickchart.io/chart?c=${encodedChartConfiguration}&backgroundColor=${backgroundColor}`;
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

await main();

export { countFilesInPath };
