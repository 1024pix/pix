import {
  SCO_COLLEGE_CERTIF_CENTER_ID,
  SCO_COLLEGE_CERTIF_CENTER_NAME,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
  SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME,
  DROIT_CERTIF_CENTER_ID,
  DROIT_CERTIF_CENTER_NAME,
  SUP_CERTIF_CENTER_NAME,
  SUP_CERTIF_CENTER_ID,
} from './certification-centers-builder';

import { PIX_SUPER_ADMIN_ID } from './../users-builder';
const EMPTY_SESSION_ID = 1;
const STARTED_SESSION_ID = 2;
const STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID = 3;
const TO_FINALIZE_SESSION_ID = 4;
const NO_PROBLEM_FINALIZED_SESSION_ID = 5;
const PROBLEMS_FINALIZED_SESSION_ID = 6;
const NO_CERTIF_CENTER_SESSION_ID = 7;
const PUBLISHED_SESSION_ID = 8;
const SCO_NO_MANAGING_STUDENTS_AEFE_SESSION_ID = 12;
const PIX_DROIT_SESSION_ID = 9;
const PUBLISHED_SCO_SESSION_ID = 10;
const COMPLEMENTARY_CERTIFICATIONS_SESSION_ID = 11;

function certificationSessionsBuilder({ databaseBuilder }) {
  const certificationCenter = SCO_COLLEGE_CERTIF_CENTER_NAME;
  const certificationCenterId = SCO_COLLEGE_CERTIF_CENTER_ID;
  const address = 'Anne-Star Street';
  const room = 'Salle Anne';
  const examiner = 'Anne';
  const date = '2020-01-31';
  const time = '15:00';

  databaseBuilder.factory.buildSession({
    id: EMPTY_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-empty`,
    date,
    time,
    description: 'Session pas commencée avec ZERO candidat inscrit.',
    accessCode: 'ANNE01',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: STARTED_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-started`,
    date,
    time,
    description: 'Session pas commencée avec quelques candidats inscrits non liés.',
    accessCode: 'ANNE02',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-lot-of-candidates`,
    date,
    time,
    description: 'Session pas commencée avec des candidats inscrits non liés.',
    accessCode: 'ANNE03',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: TO_FINALIZE_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-to-finalize`,
    date,
    time,
    description: 'Session pas encore finalisée, avec des candidats ayant passés leur test de certification.',
    accessCode: 'ANNE04',
    examinerGlobalComment: null,
  });

  databaseBuilder.factory.buildSession({
    id: NO_PROBLEM_FINALIZED_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-no-problem`,
    date,
    time,
    description:
      'Session finalisée sans problème, donc aucun commentaire et le surveillant a vu tous les écrans de fin de test.',
    accessCode: 'ANNE05',
    examinerGlobalComment: null,
    finalizedAt: new Date('2020-04-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildFinalizedSession({
    sessionId: NO_PROBLEM_FINALIZED_SESSION_ID,
    certificationCenterName: certificationCenter,
    isPublishable: true,
    publishedAt: null,
    date,
    time,
    finalizedAt: new Date('2020-04-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: PROBLEMS_FINALIZED_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-problems`,
    date,
    time,
    description: 'Session finalisée à problèmes et assignée !',
    accessCode: 'ANNE06',
    examinerGlobalComment: 'Une météorite est tombée sur le centre de certification pendant la session !!',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    assignedCertificationOfficerId: PIX_SUPER_ADMIN_ID,
    juryComment:
      'Tu te rends compte, si on n’avait pas perdu une heure et quart, on serait là depuis une heure et quart !',
    juryCommentAuthorId: PIX_SUPER_ADMIN_ID,
    juryCommentedAt: new Date('2021-04-28T00:42:03Z'),
  });

  databaseBuilder.factory.buildFinalizedSession({
    sessionId: PROBLEMS_FINALIZED_SESSION_ID,
    certificationCenterName: certificationCenter,
    isPublishable: false,
    publishedAt: null,
    date,
    time,
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    assignedCertificationOfficerName: 'Super Admin',
  });

  databaseBuilder.factory.buildSession({
    id: NO_CERTIF_CENTER_SESSION_ID,
    certificationCenterId: null,
    certificationCenter: 'Centre de certif pas dans la BDD !',
    address,
    room,
    examiner,
    date,
    time,
    description: 'Session sans vrai certification center !',
    accessCode: 'ANNE07',
    examinerGlobalComment: 'Salut les zouzous',
    finalizedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: PUBLISHED_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-published`,
    date,
    time,
    description: 'Session publiée',
    accessCode: 'ANNE08',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildFinalizedSession({
    sessionId: PUBLISHED_SESSION_ID,
    certificationCenterName: certificationCenter,
    isPublishable: true,
    date,
    time,
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: PUBLISHED_SCO_SESSION_ID,
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-published-sco`,
    date,
    time,
    description: 'Session publiée',
    accessCode: 'ANNE08',
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildFinalizedSession({
    sessionId: PUBLISHED_SCO_SESSION_ID,
    certificationCenterName: certificationCenter,
    isPublishable: true,
    date,
    time,
    finalizedAt: new Date('2020-05-05T15:00:34Z'),
    publishedAt: new Date('2020-06-05T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: COMPLEMENTARY_CERTIFICATIONS_SESSION_ID,
    certificationCenterName: SUP_CERTIF_CENTER_NAME,
    certificationCenterId: SUP_CERTIF_CENTER_ID,
    date,
    time,
    description: 'Candidats avec des certifications complémentaires',
  });

  // Some sessions to illustrate paginated sessions list order in PixAdmin
  databaseBuilder.factory.buildSession({
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-1`,
    date,
    time,
    finalizedAt: null,
    publishedAt: null,
  });
  const finalizedSession = databaseBuilder.factory.buildSession({
    certificationCenter,
    certificationCenterId,
    address,
    createdAt: new Date('2018-01-01T00:00:00Z'),
    date: '2018-01-02',
    finalizedAt: new Date('2018-01-03T00:00:00Z'),
    publishedAt: null,
  });
  databaseBuilder.factory.buildFinalizedSession({
    sessionId: finalizedSession.id,
    certificationCenterName: certificationCenter,
    isPublishable: true,
    date: '2018-01-02',
    time,
    finalizedAt: new Date('2018-01-03T00:00:00Z'),
    publishedAt: null,
  });

  databaseBuilder.factory.buildSession({
    certificationCenter,
    certificationCenterId,
    finalizedAt: new Date('2018-01-02T00:00:00Z'),
    publishedAt: null,
    resultsSentToPrescriberAt: new Date('2018-01-04T00:00:00Z'),
  });
  databaseBuilder.factory.buildSession({
    certificationCenter,
    certificationCenterId,
    address,
    room,
    examiner: `${examiner}-2`,
    date,
    time,
    finalizedAt: new Date('2018-01-02T00:00:00Z'),
    publishedAt: new Date('2018-01-03T00:00:00Z'),
  });

  databaseBuilder.factory.buildSession({
    id: SCO_NO_MANAGING_STUDENTS_AEFE_SESSION_ID,
    certificationCenter: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_NAME,
    certificationCenterId: SCO_NO_MANAGING_STUDENTS_CERTIF_CENTER_ID,
    address,
    room,
    examiner,
    date,
    time,
    description: 'Certification AEFE',
    finalizedAt: null,
    publishedAt: null,
  });

  databaseBuilder.factory.buildSession({
    id: PIX_DROIT_SESSION_ID,
    certificationCenter: DROIT_CERTIF_CENTER_NAME,
    certificationCenterId: DROIT_CERTIF_CENTER_ID,
    address,
    room,
    examiner: `${examiner}-3`,
    date,
    time,
    description: 'Certif avec pix+droit',
    accessCode: 'DROI01',
    finalizedAt: null,
    publishedAt: null,
  });
}

export default {
  certificationSessionsBuilder,
  EMPTY_SESSION_ID,
  STARTED_SESSION_ID,
  STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
  TO_FINALIZE_SESSION_ID,
  NO_PROBLEM_FINALIZED_SESSION_ID,
  PROBLEMS_FINALIZED_SESSION_ID,
  NO_CERTIF_CENTER_SESSION_ID,
  PUBLISHED_SESSION_ID,
  PUBLISHED_SCO_SESSION_ID,
  SCO_NO_MANAGING_STUDENTS_AEFE_SESSION_ID,
  PIX_DROIT_SESSION_ID,
  COMPLEMENTARY_CERTIFICATIONS_SESSION_ID,
};
