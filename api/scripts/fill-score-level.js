import request from 'request-promise-native';
import * as url from 'url';

function parseArgs(argv) {
  return argv.slice(3);
}

function buildRequestObject(baseUrl, assessmentId) {
  return {
    baseUrl: baseUrl,
    method: 'POST',
    url: '/api/assessment-results/',
    json: true,
    body: {
      data: {
        attributes: {
          'estimated-level': null,
          'pix-score': null,
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: assessmentId,
            },
          },
        },
        type: 'assessment-results',
      },
    },
  };
}

function main() {
  const baseUrl = process.argv[2];
  const ids = parseArgs(process.argv);
  const requests = Promise.all(
    ids.map((id) => buildRequestObject(baseUrl, id)).map((requestObject) => request(requestObject))
  );

  return requests.then(() => {
    console.log('Update EstimatedLevel and PixScore for : ' + ids);
  });
}

/*=================== tests =============================*/

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

if (isLaunchedFromCommandLine) {
  console.log('Start script : ');
  main();
}
