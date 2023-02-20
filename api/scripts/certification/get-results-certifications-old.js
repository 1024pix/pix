import json2csv from 'json2csv';
import moment from 'moment-timezone';

// request.debug = true;
const HEADERS = [
  'Numero certification',
  'Date de début',
  'Date de fin',
  'Note Pix',
  '1.1',
  '1.2',
  '1.3',
  '2.1',
  '2.2',
  '2.3',
  '2.4',
  '3.1',
  '3.2',
  '3.3',
  '3.4',
  '4.1',
  '4.2',
  '4.3',
  '5.1',
  '5.2',
];

function parseArgs(argv) {
  return argv.slice(3);
}

function buildRequestObject(baseUrl, authToken, certificationId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken,
    },
    baseUrl: baseUrl,
    url: `/api/admin/certifications/${certificationId}/details`,
    json: true,
    transform: (body) => {
      body.certificationId = certificationId;
      return body;
    },
  };
}

function makeRequest(config) {
  return request(config);
}

function findCompetence(profile, competenceName) {
  const result = profile.find((competence) => competence.index === competenceName);
  return (result || { obtainedLevel: '' }).obtainedLevel;
}

function toCSVRow(rowJSON) {
  const res = {};
  const [idColumn, dateStartColumn, dateEndColumn, noteColumn, ...competencesColumns] = HEADERS;
  res[idColumn] = rowJSON.certificationId;
  res[dateStartColumn] = moment.utc(rowJSON.createdAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  if (rowJSON.completedAt) {
    res[dateEndColumn] = moment.utc(rowJSON.completedAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  } else {
    res[dateEndColumn] = '';
  }

  res[noteColumn] = rowJSON.totalScore;
  competencesColumns.forEach((column) => {
    res[column] = findCompetence(rowJSON.competencesWithMark, column);
  });
  return res;
}

function main() {
  const baseUrl = process.argv[2];
  const authToken = process.argv[3];
  const ids = parseArgs(process.argv.slice(4));
  const requests = Promise.all(
    ids.map((id) => buildRequestObject(baseUrl, authToken, id)).map((requestObject) => makeRequest(requestObject))
  );

  requests
    .then((certificationResults) => certificationResults.map(toCSVRow))
    .then((res) =>
      json2csv({
        data: res,
        fieldNames: HEADERS,
        del: ';',
      })
    )
    .then((csv) => {
      console.log(`\n\n${csv}\n\n`);
      return csv;
    });
}

/*=================== tests =============================*/

if (require.main === module) {
  main();
} else {
  module.exports = {
    parseArgs,
    toCSVRow,
    buildRequestObject,
    findCompetence,
    HEADERS,
  };
}
