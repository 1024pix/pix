#! /usr/bin/env node
const request = require('request-promise-native');

function buildRequestObject(baseUrl, authToken, assessmentId) {
  const request = {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + authToken,
      'Connection': 'keep-alive',
    },
    baseUrl: baseUrl,
    body: {
      'data': {
        'attributes': {
        },
        'relationships': {
          'assessment': {
            'data': {
              'id': assessmentId,
            },

          },
        },
      },
    },
    url: '/api/assessment-results?recompute=true',
    json: true,
  };
  return request;
}

function main() {

  const baseUrl = process.argv[2];
  const authToken = process.argv[3];
  const min = parseInt(process.argv[4], 10);
  const max = parseInt(process.argv[5], 10);

  const listCertif = [];
  for (let i = min; i <= max; i++) {
    listCertif.push(i);
  }
  const requests = Promise.all(
    listCertif.map((id) => buildRequestObject(baseUrl, authToken, id))
      .map((requestObject) => request(requestObject)));

  requests
    .then((result) => console.log(result))
    .catch((err) => console.error(err));
  process.exit();
}

if (require.main === module) {
  main();
}
