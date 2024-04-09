import * as url from 'node:url';

import axios from 'axios';

function parseArgs(argv) {
  return argv.slice(3);
}

function buildRequestObject(baseURL, assessmentId) {
  return {
    baseURL,
    method: 'POST',
    url: '/api/assessment-results/',
    data: {
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
  const baseURL = process.argv[2];
  const ids = parseArgs(process.argv);
  const requests = Promise.all(
    ids.map((id) => buildRequestObject(baseURL, id)).map((requestObject) => axios(requestObject)),
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
