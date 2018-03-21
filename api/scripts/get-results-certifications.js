#! /usr/bin/env node

const request = require('request-promise-native');
const json2csv = require('json2csv');
const moment = require('moment-timezone');

// request.debug = true;
const HEADERS = [
  'Numero certification', 'Date de début', 'Date de fin', 'Note Pix',
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2',
];

function parseArgs(argv) {
  const [_a, _b, _c, ...args] = argv;
  return args;
}

function buildRequestObject(baseUrl, authToken, certificationId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken
    },
    baseUrl: baseUrl,
    url: `/api/admin/certifications/${certificationId}`,
    json: true,
    transform: (body) => {
      body.data.attributes.certificationId = certificationId;
      return body;
    }
  };
}

function makeRequest(config) {
  return request(config);
}

function findCompetence(profile, competenceName) {
  const result = profile.find(competence => competence['competence-code'] === competenceName);
  return (result || { level: '' }).level;
}

function toCSVRow(rowJSON) {
  const certificationData = rowJSON.data.attributes;
  const res = {};
  const [idColumn, dateStartColumn, dateEndColumn, noteColumn, ...competencesColumns] = HEADERS;
  res[idColumn] = certificationData.certificationId;
  res[dateStartColumn] = moment.utc(certificationData['created-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  if (certificationData['completed-at']) {
    res[dateEndColumn] = moment(certificationData['completed-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  } else {
    res[dateEndColumn] = '';
  }

  res[noteColumn] = certificationData['pix-score'];
  competencesColumns.forEach(column => {
    res[column] = findCompetence(certificationData['competences-with-mark'], column);
  });
  return res;
}

function main() {
  const baseUrl = process.argv[2];
  const authToken = process.argv[3];
  const ids = parseArgs(process.argv.slice(4));
  const requests = Promise.all(
    ids.map(id => buildRequestObject(baseUrl, authToken, id))
      .map(requestObject => makeRequest(requestObject))
  );

  return requests.then(certificationResults => certificationResults.map(toCSVRow))
    .then(res => json2csv({
      data: res,
      fieldNames: HEADERS,
      del: ';',
    }))
    .then(csv => {
      console.log(`\n\n${csv}\n\n`);
      return csv;
    });
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  parseArgs,
  buildRequestObject,
  toCSVRow,
  findCompetence
};
