#! /usr/bin/env node

const fileSystem = require('fs');

const request = require('request-promise-native');
const json2csv = require('json2csv');
const moment = require('moment-timezone');

const HEADERS = [
  'Numero certification', 'Numero de session', 'Date de début', 'Date de fin',
  'Status de la session', 'Note Pix',
  'Prénom', 'Nom', 'Date de naissance', 'Lieu de naissance',
  'Commentaire pour le candidat', 'Commentaire pour l\'organisation', 'Commentaire du jury',
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2'
];

function buildSessionRequest(baseUrl, authToken, sessionId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken
    },
    baseUrl: baseUrl,
    url: `/api/sessions/${sessionId}`,
    json: true
  };
}

function buildCertificationRequest(baseUrl, authToken, certificationId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken
    },
    baseUrl: baseUrl,
    url: `/api/admin/certifications/${certificationId}`,
    json: true,
    simple: false
  };
}

function findCompetence(profile, competenceName) {
  const result = profile.find(competence => competence['competence-code'] === competenceName);
  return (result || { level: '' }).level;
}

function toCSVRow(rowJSON) {
  if(!rowJSON.data) {
    return {};
  }
  const certificationData = rowJSON.data.attributes;
  const res = {};

  const [id,
    sessionNumber,
    dateStart,
    dateEnd,
    status,
    note,
    firstname,
    lastname,
    birthdate,
    birthplace,
    commentCandidate,
    commentOrganization,
    commentJury,
    ...competencess] = HEADERS;

  res[id] = certificationData['certification-id'];
  res[sessionNumber] = certificationData['session-id'];

  res[dateStart] = moment.utc(certificationData['created-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  if (certificationData['completed-at']) {
    res[dateEnd] = moment(certificationData['completed-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  } else {
    res[dateEnd] = '';
  }

  res[status] = certificationData['status'];
  res[note] = certificationData['pix-score'];
  res[firstname] = certificationData['first-name'];
  res[lastname] = certificationData['last-name'];
  res[birthdate] = certificationData['birthdate'];
  res[birthplace] = certificationData['birthplace'];
  res[commentCandidate] = certificationData['comment-for-candidate'];
  res[commentOrganization] = certificationData['comment-for-organization'];
  res[commentJury] = certificationData['comment-for-jury'];

  competencess.forEach(column => {
    res[column] = findCompetence(certificationData['competences-with-mark'], column);
  });

  return res;
}

function saveInFile(csv) {
  const filepath = moment().format('DD-MM-YYYY_HH-mm') + '.csv';
  const csvData = '\uFEFF' + csv;
  fileSystem.writeFile(filepath, csvData, (err) => {
    if (err) throw err;
    console.log('Les données de certifications sont dans le fichier :' + filepath);
  });
}

function main() {
  const baseUrl = process.argv[2];
  const authToken = process.argv[3];
  const sessionId = process.argv[4];
  const sessionRequest = buildSessionRequest(baseUrl, authToken, sessionId);
  return request(sessionRequest)
    .then((session) => {
      return session.data.relationships.certifications.data.map((certification) => {
        return certification.id;
      });
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        throw new Error(`L'id session n'existe pas`);
      }
    })
    .then((certificationIds) => {
      const certificationsRequests = Promise.all(
        certificationIds.map(certificationId => buildCertificationRequest(baseUrl, authToken, certificationId))
          .map(requestObject => request(requestObject))
      );

      return certificationsRequests.then(certificationResults => certificationResults.map(toCSVRow))
        .then(certificationResult => json2csv({
          data: certificationResult,
          fieldNames: HEADERS,
          del: ';',
        }))
        .then(csv => {
          saveInFile(csv);
          console.log(`\n\n${csv}\n\n`);
          return csv;
        });
    })
    .catch((err) => {
      console.log(err.message);
    });

}

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  buildCertificationRequest,
  toCSVRow,
  findCompetence,
  buildSessionRequest
};
