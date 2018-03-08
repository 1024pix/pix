#! /usr/bin/env node

const request = require('request-promise-native');

function parseArgs(argv) {
  const [_a, _b, _c, ...args] = argv;
  return args;
}

function buildRequestObject(baseUrl, assessmentId) {
  return {
    baseUrl: baseUrl,
    method: 'POST',
    url: `/api/assessment-ratings/`,
    json: true,
    body: {
        data: {
          attributes: {
            'estimated-level': null,
            'pix-score': null
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: assessmentId
              }
            }
          },
          type: 'assessment-ratings'
        }
      },
  };
}

function main() {
  const baseUrl = process.argv[2];
  const ids = parseArgs(process.argv);
  const requests = Promise.all(
    ids.map(id => buildRequestObject(baseUrl, id))
      .map(requestObject => request(requestObject))
  );

  requests.then(() => {
    console.log('Update EstimatedLevel and PixScore for : '+ids);
  });
}


main();
/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  console.log('Start script : ');
  main();
}
