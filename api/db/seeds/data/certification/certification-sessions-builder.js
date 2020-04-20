const { SCO_CERTIF_CENTER_ID, SCO_CERTIF_CENTER_NAME } = require('./certification-centers-builder');
const EMPTY_SESSION_ID = 1;
const STARTED_SESSION_ID = 2;
const STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID = 3;
const TO_FINALIZE_SESSION_ID = 4;
const NO_PROBLEM_FINALIZED_SESSION_ID = 5;
const PROBLEMS_FINALIZED_SESSION_ID = 6;
const NO_CERTIF_CENTER_SESSION_ID = 7;
const PUBLISHED_SESSION_ID = 8;

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
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: STARTED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec quelques candidats inscrits non liés.',
    accessCode: 'ANNE02',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec des candidats inscrits non liés.',
    accessCode: 'ANNE03',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: TO_FINALIZE_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session pas encore finalisée, avec des candidats ayant passés leur test de certification.',
    accessCode: 'ANNE04',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: NO_PROBLEM_FINALIZED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session finalisée sans problème, donc aucun commentaire et le surveillant a vu tous les écrans de fin de test.',
    accessCode: 'ANNE05',
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-04-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: PROBLEMS_FINALIZED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session finalisée à problèmes et assignée !',
    accessCode: 'ANNE06',
    examinerGlobalComment: 'Une météorite est tombée sur le centre de certification pendant la session !!',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    assignedUserId: 5, //pixMaster
  });

  databaseBuilder.factory.buildSession({
    id: NO_CERTIF_CENTER_SESSION_ID,
    certificationCenterId: null, certificationCenter: 'Centre de certif pas dans la BDD !',
    address, room, examiner, date , time,
    description: 'Session sans vrai certification center !',
    accessCode: 'ANNE07',
    examinerGlobalComment: 'Salut les zouzous',
    finalizedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: PUBLISHED_SESSION_ID,
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    description: 'Session publiée',
    accessCode: 'ANNE08',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });

  // Some sessions to illustrate paginated sessions list order in PixAdmin
  databaseBuilder.factory.buildSession({
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    finalizedAt: null,
    publishedAt: null,
  });
  databaseBuilder.factory.buildSession({
    certificationCenter, certificationCenterId,
    finalizedAt: new Date('2018-01-01T00:00:00Z'),
    publishedAt: null,
  });
  databaseBuilder.factory.buildSession({
    certificationCenter, certificationCenterId,
    finalizedAt: new Date('2018-01-02T00:00:00Z'),
    publishedAt: null,
    resultsSentToPrescriberAt: new Date('2018-01-04T00:00:00Z'),
  });
  databaseBuilder.factory.buildSession({
    certificationCenter, certificationCenterId, address, room, examiner, date , time,
    finalizedAt: new Date('2018-01-02T00:00:00Z'),
    publishedAt: new Date('2018-01-03T00:00:00Z'),
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
  NO_CERTIF_CENTER_SESSION_ID,
  PUBLISHED_SESSION_ID,
};
