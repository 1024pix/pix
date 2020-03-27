const _ = require('lodash');
const {
  ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID,
  ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID,
  ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID,
  ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID,
} = require('./certification-courses-builder');
const {
  CERTIFICATION_FAILURE_ANSWERS_DATA,
  CERTIFICATION_SUCCESS_ANSWERS_DATA,
  CERTIFICATION_FAILURE_COMPETENCE_MARKS_DATA,
  CERTIFICATION_SUCCESS_COMPETENCE_MARKS_DATA,
} = require('./certification-data');

function certificationScoresBuilder({ databaseBuilder }) {
  // Each certification present the same scores per user.
  // The "success" user answered the same successful answers to same questions regardless of the certification course.
  // Idem for the "failed" user, but in a "failed" way.
  const createdAt = new Date('2020-01-31T00:00:00Z');
  _.each(
    [ ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID, ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID, ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID, ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID, ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID ],
    (assessmentId) => {
      _buildSuccessScore(databaseBuilder, createdAt, assessmentId);
    });
  _.each(
    [ ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID, ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID, ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID, ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID ],
    (assessmentId) => {
      _buildFailureScore(databaseBuilder, createdAt, assessmentId);
    });
}

function _buildSuccessScore(databaseBuilder, createdAt, assessmentId) {
  _.each(CERTIFICATION_SUCCESS_ANSWERS_DATA, (answerData) => {
    databaseBuilder.factory.buildAnswer({ ...answerData, value: 'Dummy value', assessmentId, createdAt });
  });
  let assessmentResultId;
  if (assessmentId === ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID) {
    assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
      level: null, pixScore: 518, emitter: 'PIX-ALGO', status: 'started', commentForJury: null,
      commentForCandidate: null, commentForOrganization: null, juryId: null, assessmentId, createdAt,
    }).id;
  } else {
    assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
      level: null, pixScore: 518, emitter: 'PIX-ALGO', status: 'validated', commentForJury: null,
      commentForCandidate: null, commentForOrganization: null, juryId: null, assessmentId, createdAt,
    }).id;
  }
  _.each(CERTIFICATION_SUCCESS_COMPETENCE_MARKS_DATA, (competenceMarkData) => {
    databaseBuilder.factory.buildCompetenceMark({ ...competenceMarkData, assessmentResultId, createdAt });
  });
}

function _buildFailureScore(databaseBuilder, createdAt, assessmentId) {
  _.each(CERTIFICATION_FAILURE_ANSWERS_DATA, (answerData) => {
    databaseBuilder.factory.buildAnswer({ ...answerData, value: 'Dummy value', assessmentId, createdAt });
  });
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    level: -1, pixScore: 0, emitter: 'PIX-ALGO', status: 'rejected', commentForJury: null,
    commentForCandidate: null, commentForOrganization: null, juryId: null, assessmentId, createdAt
  }).id;
  _.each(CERTIFICATION_FAILURE_COMPETENCE_MARKS_DATA, (competenceMarkData) => {
    databaseBuilder.factory.buildCompetenceMark({ ...competenceMarkData, assessmentResultId, createdAt });
  });
}

module.exports = certificationScoresBuilder;
