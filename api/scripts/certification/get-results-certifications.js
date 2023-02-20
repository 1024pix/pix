import json2csv from 'json2csv';
import moment from 'moment-timezone';

const HEADERS = [
  'ID de certification',
  'Prenom du candidat',
  'Nom du candidat',
  'Date de naissance du candidat',
  'Lieu de naissance du candidat',
  'Identifiant Externe',
  'Statut de la certification',
  'ID de session',
  'Date de debut',
  'Date de fin',
  'Commentaire pour le candidat',
  "Commentaire pour l'organisation",
  'Commentaire pour le jury',
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

function buildSessionRequest(baseUrl, authToken, sessionId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken,
    },
    baseUrl: baseUrl,
    url: `/api/sessions/${sessionId}`,
    json: true,
  };
}

function buildCertificationRequest(baseUrl, authToken, certificationId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken,
    },
    baseUrl: baseUrl,
    url: `/api/admin/certifications/${certificationId}`,
    json: true,
    simple: false,
  };
}

function findCompetence(profile, competenceName) {
  const result = profile.find((competence) => competence.competence_code === competenceName);
  return (result || { level: '' }).level;
}

function toCSVRow(rowJSON) {
  if (!rowJSON.data) {
    return {};
  }
  const certificationData = rowJSON.data.attributes;
  const res = {};

  const [
    id,
    firstname,
    lastname,
    birthdate,
    birthplace,
    externalId,
    status,
    sessionNumber,
    dateStart,
    dateEnd,
    commentCandidate,
    commentOrganization,
    commentJury,
    note,
    ...competencess
  ] = HEADERS;

  res[id] = certificationData['certification-id'];
  res[firstname] = certificationData['first-name'];
  res[lastname] = certificationData['last-name'];

  if (certificationData['birthdate']) {
    res[birthdate] = moment.utc(certificationData['birthdate'], 'YYYY-MM-DD').tz('Europe/Paris').format('DD/MM/YYYY');
  } else {
    res[birthdate] = '';
  }

  res[birthplace] = certificationData['birthplace'];
  res[externalId] = certificationData['external-id'];
  res[status] = certificationData['status'];

  res[sessionNumber] = certificationData['session-id'];

  res[dateStart] = moment.utc(certificationData['created-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  if (certificationData['completed-at']) {
    res[dateEnd] = moment(certificationData['completed-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  } else {
    res[dateEnd] = '';
  }

  res[commentCandidate] = certificationData['comment-for-candidate'];
  res[commentOrganization] = certificationData['comment-for-organization'];
  res[commentJury] = certificationData['comment-for-jury'];

  res[note] = certificationData['pix-score'];

  competencess.forEach((column) => {
    res[column] = findCompetence(certificationData['competences-with-mark'], column);
  });

  return res;
}

function saveInFile(csv, sessionId) {
  const filepath = `session_${sessionId}_export_${moment.utc().format('DD-MM-YYYY_HH-mm')}.csv`;
  fileSystem.writeFile(filepath, csv, (err) => {
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
        console.error(err);
        throw new Error("L'id session n'existe pas");
      }
    })
    .then((certificationIds) => {
      const certificationsRequests = Promise.all(
        certificationIds
          .map((certificationId) => buildCertificationRequest(baseUrl, authToken, certificationId))
          .map((requestObject) => request(requestObject))
      );

      return certificationsRequests
        .then((certificationResults) => certificationResults.map(toCSVRow))
        .then((certificationResult) =>
          json2csv({
            data: certificationResult,
            fieldNames: HEADERS,
            del: ';',
            withBOM: true,
          })
        )
        .then((csv) => {
          saveInFile(csv, sessionId);
          console.log(`\n\n${csv}\n\n`);
          return csv;
        });
    })
    .catch((err) => {
      console.log(err.message);
    });
}

if (require.main === module) {
  main();
}

export default {
  buildCertificationRequest,
  toCSVRow,
  findCompetence,
  buildSessionRequest,
};
