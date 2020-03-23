const { SCO_CERTIF_CENTER_ID, SCO_CERTIF_CENTER_NAME } = require('./certification-centers-builder');
const { statuses } = require('../../../../lib/domain/models/Session');
const EMPTY_SESSION_ID = 1;
const STARTED_SESSION_ID = 2;
const STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID = 3;
const TO_FINALIZE_SESSION_ID = 4;
const NO_PROBLEM_FINALIZED_SESSION_ID = 5;
const PROBLEMS_FINALIZED_SESSION_ID = 6;

function certificationSessionsBuilder({ databaseBuilder }) {
  const certificationCenter = SCO_CERTIF_CENTER_NAME;
  const certificationCenterId = SCO_CERTIF_CENTER_ID;
  const address = 'Anne-Star Street';
  const room = 'Salle Anne';
  const examiner = 'Anne-Quelquechose';
  const date = '2020-03-04';
  const time = '15:00';

  databaseBuilder.factory.buildSession({
    id: EMPTY_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec ZERO candidat inscrit.',
    accessCode: 'ANNE01',
    status: statuses.CREATED,
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: STARTED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec quelques candidats inscrits non liés.',
    accessCode: 'ANNE02',
    status: statuses.CREATED,
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec des candidats inscrits non liés.',
    accessCode: 'ANNE03',
    status: statuses.CREATED,
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: TO_FINALIZE_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas encore finalisée, avec des candidats ayant passés leur test de certification.',
    accessCode: 'ANNE04',
    status: statuses.CREATED,
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: NO_PROBLEM_FINALIZED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session finalisée sans problème, donc aucun commentaire et le surveillant a vu tous les écrans de fin de test.',
    accessCode: 'ANNE05',
    status: statuses.FINALIZED,
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-04-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: PROBLEMS_FINALIZED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session finalisée à problèmes !',
    accessCode: 'ANNE06',
    status: statuses.FINALIZED,
    examinerGlobalComment: 'Une météorite est tombée sur le centre de certification pendant la session !!',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
  });
}

module.exports = {
  certificationSessionsBuilder,
  EMPTY_SESSION_ID,
  STARTED_SESSION_ID,
  STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
  TO_FINALIZE_SESSION_ID,
  NO_PROBLEM_FINALIZED_SESSION_ID,
  PROBLEMS_FINALIZED_SESSION_ID,
};
