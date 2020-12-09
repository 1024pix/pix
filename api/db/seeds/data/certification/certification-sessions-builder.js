const { SCO_CERTIF_CENTER_ID, SCO_CERTIF_CENTER_NAME, SUP_CERTIF_CENTER_ID, SUP_CERTIF_CENTER_NAME } = require('./certification-centers-builder');
const { PIX_MASTER_ID } = require('./../users-builder');
const SUP_EMPTY_SESSION_ID = 1;
const SUP_STARTED_SESSION_ID = 2;
const SUP_STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID = 3;
const SUP_TO_FINALIZE_SESSION_ID = 4;
const SUP_NO_PROBLEM_FINALIZED_SESSION_ID = 5;
const SUP_PROBLEMS_FINALIZED_SESSION_ID = 6;
const SUP_NO_CERTIF_CENTER_SESSION_ID = 7;
const SUP_PUBLISHED_SESSION_ID = 8;

const SCO_EMPTY_SESSION_ID = 9;
const SCO_STARTED_SESSION_ID = 10;
const SCO_STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID = 11;
const SCO_TO_FINALIZE_SESSION_ID = 12;
const SCO_NO_PROBLEM_FINALIZED_SESSION_ID = 13;
const SCO_PROBLEMS_FINALIZED_SESSION_ID = 14;
const SCO_NO_CERTIF_CENTER_SESSION_ID = 15;
const SCO_PUBLISHED_SESSION_ID = 16;

function certificationSessionsBuilder({ databaseBuilder }) {
  const scoCertificationCenterName = SCO_CERTIF_CENTER_NAME;
  const scoCertificationCenterId = SCO_CERTIF_CENTER_ID;
  const supCertificationCenterName = SUP_CERTIF_CENTER_NAME;
  const supCertificationCenterId = SUP_CERTIF_CENTER_ID;

  const address = 'Anne-Star Street';
  const room = 'Salle Anne';
  const examiner = 'Anne-Quelquechose';
  const date = '2020-03-04';
  const time = '15:00';

  databaseBuilder.factory.buildSession({
    id: SUP_EMPTY_SESSION_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sup pas commencée avec ZERO candidat inscrit.',
    accessCode: 'ANNE01',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SUP_STARTED_SESSION_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sup pas commencée avec quelques candidats inscrits non liés.',
    accessCode: 'ANNE02',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SUP_STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec des candidats inscrits non liés.',
    accessCode: 'ANNE03',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SUP_TO_FINALIZE_SESSION_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sup pas encore finalisée, avec des candidats ayant passés leur test de certification.',
    accessCode: 'ANNE04',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SUP_NO_PROBLEM_FINALIZED_SESSION_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sup finalisée sans problème, donc aucun commentaire et le surveillant a vu tous les écrans de fin de test.',
    accessCode: 'ANNE05',
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-04-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: SUP_PROBLEMS_FINALIZED_SESSION_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sup finalisée à problèmes et assignée !',
    accessCode: 'ANNE06',
    examinerGlobalComment: 'Une météorite est tombée sur le centre de certification pendant la session sup !!',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    assignedCertificationOfficerId: PIX_MASTER_ID,
  });

  databaseBuilder.factory.buildSession({
    id: SUP_NO_CERTIF_CENTER_SESSION_ID,
    certificationCenterId: null, certificationCenter: 'Centre de certif pas dans la BDD !',
    address, room, examiner, date , time,
    description: 'Session sup sans vrai certification center !',
    accessCode: 'ANNE07',
    examinerGlobalComment: 'Salut les zouzous',
    finalizedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: SUP_PUBLISHED_SESSION_ID,
    certificationCenter: supCertificationCenterName, certificationCenterId: supCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sup publiée',
    accessCode: 'ANNE08',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: SCO_EMPTY_SESSION_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sco pas commencée avec ZERO candidat inscrit.',
    accessCode: 'ANNE09',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SCO_STARTED_SESSION_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sco pas commencée avec quelques candidats inscrits non liés.',
    accessCode: 'ANNE10',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SCO_STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session pas commencée avec des candidats inscrits non liés.',
    accessCode: 'ANNE11',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SCO_TO_FINALIZE_SESSION_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sco pas encore finalisée, avec des candidats ayant passés leur test de certification.',
    accessCode: 'ANNE12',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: SCO_NO_PROBLEM_FINALIZED_SESSION_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sco finalisée sans problème, donc aucun commentaire et le surveillant a vu tous les écrans de fin de test.',
    accessCode: 'ANNE12',
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-04-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: SCO_PROBLEMS_FINALIZED_SESSION_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sco finalisée à problèmes et assignée !',
    accessCode: 'ANNE13',
    examinerGlobalComment: 'Une météorite est tombée sur le centre de certification pendant la session sco !!',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    assignedCertificationOfficerId: PIX_MASTER_ID,
  });

  databaseBuilder.factory.buildSession({
    id: SCO_NO_CERTIF_CENTER_SESSION_ID,
    certificationCenterId: null, certificationCenter: 'Centre de certif pas dans la BDD !',
    address, room, examiner, date , time,
    description: 'Session sco sans vrai certification center !',
    accessCode: 'ANNE14',
    examinerGlobalComment: 'Salut les zouzous',
    finalizedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: SCO_PUBLISHED_SESSION_ID,
    certificationCenter: scoCertificationCenterName, certificationCenterId: scoCertificationCenterId, address, room, examiner, date , time,
    description: 'Session sco publiée',
    accessCode: 'ANNE15',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });
}

module.exports = {
  certificationSessionsBuilder,
  SUP_EMPTY_SESSION_ID,
  SUP_STARTED_SESSION_ID,
  SUP_STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
  SUP_TO_FINALIZE_SESSION_ID,
  SUP_NO_PROBLEM_FINALIZED_SESSION_ID,
  SUP_PROBLEMS_FINALIZED_SESSION_ID,
  SUP_NO_CERTIF_CENTER_SESSION_ID,
  SUP_PUBLISHED_SESSION_ID,
  SCO_EMPTY_SESSION_ID,
  SCO_STARTED_SESSION_ID,
  SCO_STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
  SCO_TO_FINALIZE_SESSION_ID,
  SCO_NO_PROBLEM_FINALIZED_SESSION_ID,
  SCO_PROBLEMS_FINALIZED_SESSION_ID,
  SCO_NO_CERTIF_CENTER_SESSION_ID,
  SCO_PUBLISHED_SESSION_ID,
};
