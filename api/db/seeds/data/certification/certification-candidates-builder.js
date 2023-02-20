import _ from 'lodash';

import {
  STARTED_SESSION_ID,
  STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
  TO_FINALIZE_SESSION_ID,
  NO_PROBLEM_FINALIZED_SESSION_ID,
  PROBLEMS_FINALIZED_SESSION_ID,
  PUBLISHED_SESSION_ID,
  PUBLISHED_SCO_SESSION_ID,
  SCO_NO_MANAGING_STUDENTS_AEFE_SESSION_ID,
  PIX_DROIT_SESSION_ID,
  COMPLEMENTARY_CERTIFICATIONS_SESSION_ID,
} from './certification-sessions-builder';

import { SCO_STUDENT_ID as SCO_STUDENT_ORGANIZATION_LEARNER_ID } from '../organizations-sco-builder';

import {
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILED_USER_ID,
  CERTIF_REGULAR_USER5_ID,
  CERTIF_SCO_STUDENT_ID,
} from './users';

import {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
} from './certification-centers-builder';

import Assessment from '../../../../lib/domain/models/Assessment';
import { BILLING_MODES } from '../../../../lib/domain/models/CertificationCandidate';

const A_LOT_OF_CANDIDATES_COUNT = 150;
const SUCCESS_CANDIDATE_IN_SESSION_TO_FINALIZE_ID = 1;
const FAILURE_CANDIDATE_IN_SESSION_TO_FINALIZE_ID = 2;
const SUCCESS_CANDIDATE_IN_NO_PROBLEM_FINALIZED_SESSION_ID = 3;
const FAILURE_CANDIDATE_IN_NO_PROBLEM_FINALIZED_SESSION_ID = 4;
const SUCCESS_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID = 5;
const FAILURE_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID = 6;
const STARTED_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID = 7;
const SUCCESS_CANDIDATE_IN_PUBLISHED_SESSION_ID = 8;
const FAILURE_CANDIDATE_IN_PUBLISHED_SESSION_ID = 9;
const SUCCESS_SCO_CANDIDATE_IN_PUBLISHED_SESSION_ID = 10;
const EDU_CANDIDATE_IN_PUBLISHED_SESSION_ID = 11;
const CANDIDATE_DATA_SUCCESS = {
  firstName: 'anne',
  lastName: 'success',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: 'destinaire-des-resulats@example.net',
};
const CANDIDATE_DATA_FAILURE = {
  firstName: 'anne',
  lastName: 'failure',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: 'destinaire-des-resulats@example.net',
};
const CANDIDATE_DATA_MISSING = {
  firstName: 'anne',
  lastName: 'missing',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: null,
};
const CANDIDATE_DATA_STARTED = {
  firstName: 'AnneNormale5',
  lastName: 'Certif5',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: null,
};
const CANDIDATE_SCO_DATA_SUCCESS = {
  firstName: 'Student',
  lastName: 'Certified',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: null,
};
const CANDIDATE_DROIT_1 = {
  firstName: 'Nicky',
  lastName: 'Larson',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: null,
  authorizedToStart: true,
};
const CANDIDATE_DROIT_2 = {
  firstName: 'Saul',
  lastName: 'Goodman',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: null,
};
const CANDIDATE_DATA_EDU = {
  firstName: 'AnneCertifEdu',
  lastName: 'Formation Initiale 1er Degré',
  birthdate: '2000-01-01',
  birthCity: 'Ici',
  resultRecipientEmail: 'destinaire-des-resultats@example.net',
};

function certificationCandidatesBuilder({ databaseBuilder }) {
  // Few candidates for the started session
  _.each([CANDIDATE_DATA_SUCCESS, CANDIDATE_DATA_FAILURE, CANDIDATE_DATA_MISSING], (candidate) => {
    databaseBuilder.factory.buildCertificationCandidate({ ...candidate, sessionId: STARTED_SESSION_ID, userId: null });
  });

  // A LOT of candidates for the BIG started session
  for (let i = 0; i < A_LOT_OF_CANDIDATES_COUNT; ++i) {
    databaseBuilder.factory.buildCertificationCandidate({
      firstName: 'Jean-Paul',
      lastName: _convertToRoman(i + 1),
      sessionId: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
      userId: null,
    });
  }

  // A candidate that is authorized to start
  databaseBuilder.factory.buildCertificationCandidate({
    firstName: 'Jean-François',
    lastName: 'Apascommencé',
    sessionId: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
    userId: null,
    authorizedToStart: true,
  });

  // A candidate that has started the session
  const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
  const candidateWithStartedTest = {
    firstName: 'Jean-Pierre',
    lastName: 'Acommencé',
    userId,
    sessionId: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID,
  };
  databaseBuilder.factory.buildCertificationCandidate({
    ...candidateWithStartedTest,
    authorizedToStart: true,
  });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    ...candidateWithStartedTest,
  });
  databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourse.id,
    state: Assessment.states.STARTED,
  });

  _addCandidateWithTestCompleted({ sessionId: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID, databaseBuilder });
  _addCandidateWithTestEndedBySupervisor({ sessionId: STARTED_SESSION_WITH_LOT_OF_CANDIDATES_ID, databaseBuilder });

  let sessionId;
  const candidateDataSuccessWithUser = { ...CANDIDATE_DATA_SUCCESS, userId: CERTIF_SUCCESS_USER_ID };
  const candidateDataSuccessWithUserSco = {
    ...CANDIDATE_SCO_DATA_SUCCESS,
    userId: CERTIF_SCO_STUDENT_ID,
    organizationLearnerId: SCO_STUDENT_ORGANIZATION_LEARNER_ID,
  };
  const candidateDataFailureWithUser = { ...CANDIDATE_DATA_FAILURE, userId: CERTIF_FAILED_USER_ID };
  const candidateDataMissingWithUser = { ...CANDIDATE_DATA_MISSING, userId: null };
  const candidateDataStartedWithUser = { ...CANDIDATE_DATA_STARTED, userId: CERTIF_REGULAR_USER5_ID };

  // Few candidates with some that have passed certification test
  sessionId = TO_FINALIZE_SESSION_ID;
  databaseBuilder.factory.buildCertificationCandidate({
    id: SUCCESS_CANDIDATE_IN_SESSION_TO_FINALIZE_ID,
    ...candidateDataSuccessWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: FAILURE_CANDIDATE_IN_SESSION_TO_FINALIZE_ID,
    ...candidateDataFailureWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({ ...candidateDataMissingWithUser, sessionId });

  // Few candidates with some that have passed certification test with finalized courses in the ZERO problem session
  sessionId = NO_PROBLEM_FINALIZED_SESSION_ID;
  databaseBuilder.factory.buildCertificationCandidate({
    id: SUCCESS_CANDIDATE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
    ...candidateDataSuccessWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: FAILURE_CANDIDATE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
    ...candidateDataFailureWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({ ...candidateDataMissingWithUser, sessionId });

  // Few candidates with some that have passed certification test with finalized courses in the Problematic session
  sessionId = PROBLEMS_FINALIZED_SESSION_ID;
  databaseBuilder.factory.buildCertificationCandidate({
    id: SUCCESS_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID,
    ...candidateDataSuccessWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: FAILURE_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID,
    ...candidateDataFailureWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: STARTED_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID,
    ...candidateDataStartedWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({ ...candidateDataMissingWithUser, sessionId });

  // Two candidates for published session
  sessionId = PUBLISHED_SESSION_ID;
  databaseBuilder.factory.buildCertificationCandidate({
    id: SUCCESS_CANDIDATE_IN_PUBLISHED_SESSION_ID,
    ...candidateDataSuccessWithUser,
    sessionId,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: FAILURE_CANDIDATE_IN_PUBLISHED_SESSION_ID,
    ...candidateDataFailureWithUser,
    sessionId,
  });

  // One candidate for published sco session
  sessionId = PUBLISHED_SCO_SESSION_ID;
  databaseBuilder.factory.buildCertificationCandidate({
    id: SUCCESS_SCO_CANDIDATE_IN_PUBLISHED_SESSION_ID,
    ...candidateDataSuccessWithUserSco,
    sessionId,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    firstName: 'John',
    lastName: 'Doe',
    sessionId: SCO_NO_MANAGING_STUDENTS_AEFE_SESSION_ID,
    userId: null,
  });

  // Candidates for Pix+Droit certification
  sessionId = PIX_DROIT_SESSION_ID;
  databaseBuilder.factory.buildCertificationCandidate({ ...CANDIDATE_DROIT_1, sessionId, userId: null });
  databaseBuilder.factory.buildCertificationCandidate({ ...CANDIDATE_DROIT_2, sessionId, userId: null });

  // Candidates for a session with complementary certification subscriptions
  sessionId = COMPLEMENTARY_CERTIFICATIONS_SESSION_ID;
  const john = databaseBuilder.factory.buildCertificationCandidate({
    firstName: 'John',
    lastName: 'Lennon',
    sessionId,
    userId: null,
    billingMode: BILLING_MODES.FREE,
  });

  const eduCandidate = databaseBuilder.factory.buildCertificationCandidate({
    ...CANDIDATE_DATA_EDU,
    id: EDU_CANDIDATE_IN_PUBLISHED_SESSION_ID,
    sessionId,
  });

  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    certificationCandidateId: john.id,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });

  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    certificationCandidateId: eduCandidate.id,
    complementaryCertificationId: PIX_EDU_2ND_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  });

  const herbie = databaseBuilder.factory.buildCertificationCandidate({
    firstName: 'Herbie',
    lastName: 'Hancock',
    sessionId,
    userId: null,
    billingMode: BILLING_MODES.PAID,
  });
  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    certificationCandidateId: herbie.id,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });
  const frank = databaseBuilder.factory.buildCertificationCandidate({
    firstName: 'Frank',
    lastName: 'Zappa',
    sessionId,
    userId: null,
    billingMode: BILLING_MODES.PREPAID,
    prepaymentCode: 'CODE1',
  });
  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    certificationCandidateId: frank.id,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationSubscription({
    certificationCandidateId: frank.id,
    complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    firstName: 'Britney',
    lastName: 'Spears',
    sessionId,
    userId: null,
    billingMode: BILLING_MODES.FREE,
  });
}

export default {
  certificationCandidatesBuilder,
  SUCCESS_CANDIDATE_IN_SESSION_TO_FINALIZE_ID,
  FAILURE_CANDIDATE_IN_SESSION_TO_FINALIZE_ID,
  SUCCESS_CANDIDATE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  FAILURE_CANDIDATE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  SUCCESS_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID,
  FAILURE_CANDIDATE_IN_PROBLEMS_FINALIZED_SESSION_ID,
  SUCCESS_CANDIDATE_IN_PUBLISHED_SESSION_ID,
  FAILURE_CANDIDATE_IN_PUBLISHED_SESSION_ID,
  SUCCESS_SCO_CANDIDATE_IN_PUBLISHED_SESSION_ID,
  EDU_CANDIDATE_IN_PUBLISHED_SESSION_ID,
  CANDIDATE_DATA_FAILURE,
  CANDIDATE_DATA_SUCCESS,
  CANDIDATE_DATA_MISSING,
  CANDIDATE_DATA_STARTED,
  CANDIDATE_SCO_DATA_SUCCESS,
  CANDIDATE_DATA_EDU,
};

const romanMatrix = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

function _convertToRoman(num) {
  if (num === 0) {
    return '';
  }
  for (let i = 0; i < romanMatrix.length; i++) {
    const [pivot, roman] = romanMatrix[i];
    if (num >= pivot) {
      return roman + _convertToRoman(num - pivot);
    }
  }
}

function _addCandidateWithTestCompleted({ sessionId, databaseBuilder }) {
  const user = databaseBuilder.factory.buildUser();
  const candidate = {
    firstName: 'Jean-Claude',
    lastName: 'Afini',
    userId: user.id,
    sessionId,
  };
  databaseBuilder.factory.buildCertificationCandidate({
    ...candidate,
    authorizedToStart: true,
  });
  const certificationCourseWithCompletedTest = databaseBuilder.factory.buildCertificationCourse({
    ...candidate,
  });
  databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourseWithCompletedTest.id,
    state: Assessment.states.COMPLETED,
  });
}

function _addCandidateWithTestEndedBySupervisor({ sessionId, databaseBuilder }) {
  const user = databaseBuilder.factory.buildUser();
  const candidate = {
    firstName: 'Jean-Michel',
    lastName: 'Avusontestterminéparlesurveillant',
    userId: user.id,
    sessionId,
  };
  databaseBuilder.factory.buildCertificationCandidate({
    ...candidate,
    authorizedToStart: true,
  });
  const certificationCourseWithCompletedTest = databaseBuilder.factory.buildCertificationCourse({
    ...candidate,
  });
  databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourseWithCompletedTest.id,
    state: Assessment.states.ENDED_BY_SUPERVISOR,
  });
}
