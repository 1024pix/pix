import fileSystem from 'fs';
import axios from 'axios';
import { Parser } from '@json2csv/plainjs';
import * as url from 'url';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

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

function buildSessionRequest(baseURL, authToken, sessionId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken,
    },
    baseURL,
    url: `/api/sessions/${sessionId}`,
  };
}

function buildCertificationRequest(baseURL, authToken, certificationId) {
  return {
    headers: {
      authorization: 'Bearer ' + authToken,
    },
    baseURL,
    url: `/api/admin/certifications/${certificationId}`,
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
    res[birthdate] = dayjs.utc(certificationData['birthdate'], 'YYYY-MM-DD').tz('Europe/Paris').format('DD/MM/YYYY');
  } else {
    res[birthdate] = '';
  }

  res[birthplace] = certificationData['birthplace'];
  res[externalId] = certificationData['external-id'];
  res[status] = certificationData['status'];

  res[sessionNumber] = certificationData['session-id'];

  res[dateStart] = dayjs.utc(certificationData['created-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  if (certificationData['completed-at']) {
    res[dateEnd] = dayjs(certificationData['completed-at']).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
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
  const filepath = `session_${sessionId}_export_${dayjs.utc().format('DD-MM-YYYY_HH-mm')}.csv`;
  fileSystem.writeFile(filepath, csv, (err) => {
    if (err) throw err;
    console.log('Les données de certifications sont dans le fichier :' + filepath);
  });
}

function main() {
  const baseURL = process.argv[2];
  const authToken = process.argv[3];
  const sessionId = process.argv[4];
  const sessionRequest = buildSessionRequest(baseURL, authToken, sessionId);
  return axios(sessionRequest)
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
          .map((certificationId) => buildCertificationRequest(baseURL, authToken, certificationId))
          .map((requestObject) => axios(requestObject)),
      );

      return certificationsRequests
        .then((certificationResults) => certificationResults.map(toCSVRow))
        .then((data) => new Parser({ fields: HEADERS, del: ';', withBOM: true }).parse(data))
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

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
if (isLaunchedFromCommandLine) {
  main();
}

export { buildCertificationRequest, toCSVRow, findCompetence, buildSessionRequest };
