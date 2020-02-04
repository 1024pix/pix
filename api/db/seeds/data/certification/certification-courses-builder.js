const _ = require('lodash');
const {
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID
} = require('./users');
const {
  TO_FINALIZE_SESSION_ID,
  NO_PROBLEM_FINALIZED_SESSION_ID,
  PROBLEMS_FINALIZED_SESSION_ID,
} = require('./certification-sessions-builder');
const {
  CANDIDATE_DATA_SUCCESS,
  CANDIDATE_DATA_FAILURE,
} = require('./certification-candidates-builder');
const { CERTIFICATION_CHALLENGES_DATA } = require('./certification-data');

const ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID = 100;
const ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID = 101;
const ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID = 102;
const ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID = 103;
const ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID = 104;
const ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID = 105;

function certificationCoursesBuilder({ databaseBuilder }) {
  // Each certification tests present the same questions
  _.each([
    { userId: CERTIF_SUCCESS_USER_ID, sessionId: TO_FINALIZE_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID, candidateData: CANDIDATE_DATA_SUCCESS, examinerComment: null, hasSeenEndTestScreen: false },
    { userId: CERTIF_FAILURE_USER_ID, sessionId: TO_FINALIZE_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID, candidateData: CANDIDATE_DATA_FAILURE, examinerComment: null, hasSeenEndTestScreen: false },
    { userId: CERTIF_SUCCESS_USER_ID, sessionId: NO_PROBLEM_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_SUCCESS, examinerComment: null, hasSeenEndTestScreen: false },
    { userId: CERTIF_FAILURE_USER_ID, sessionId: NO_PROBLEM_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_FAILURE, examinerComment: null, hasSeenEndTestScreen: false },
    { userId: CERTIF_SUCCESS_USER_ID, sessionId: PROBLEMS_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_SUCCESS, examinerComment: 'A regardé son téléphone pendant le test', hasSeenEndTestScreen: true },
    { userId: CERTIF_FAILURE_USER_ID, sessionId: PROBLEMS_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_FAILURE, examinerComment: null, hasSeenEndTestScreen: false },
  ], (certificationCourseData) => {
    _buildCertificationCourse(databaseBuilder, certificationCourseData);
  });
}

function _buildCertificationCourse(databaseBuilder, { assessmentId, userId, sessionId, candidateData, examinerComment, hasSeenEndTestScreen }) {
  const courseId = databaseBuilder.factory.buildCertificationCourse({
    ...candidateData, isPublished: false, isV2Certification: true, examinerComment, hasSeenEndTestScreen, sessionId,
  }).id;
  databaseBuilder.factory.buildAssessment({
    id: assessmentId, courseId, type: 'CERTIFICATION', state: 'completed', userId, competenceId: null,
    campaignParticipationId: null, isImproving: false,
  });
  _.each(CERTIFICATION_CHALLENGES_DATA, (challenge) => {
    databaseBuilder.factory.buildCertificationChallenge({ ...challenge, courseId, associatedSkillId: null });
  });
}

module.exports = {
  certificationCoursesBuilder,
  ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID,
  ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID,
  ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID,
} ;
