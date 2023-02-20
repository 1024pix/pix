import _ from 'lodash';

import {
  ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID,
  ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID,
  ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
  ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID,
  ASSESSMENT_SUCCESS_PUBLISHED_SESSION_SCO_ID,
  ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID,
  ASSESSMENT_SUCCESS_EDU_PUBLISHED_SESSION_ID,
} from './certification-courses-builder';

import {
  CERTIFICATION_FAILURE_ANSWERS_DATA,
  CERTIFICATION_SUCCESS_ANSWERS_DATA,
  CERTIFICATION_FAILURE_COMPETENCE_MARKS_DATA,
  CERTIFICATION_SUCCESS_COMPETENCE_MARKS_DATA,
} from './certification-data';

function certificationScoresBuilder({ databaseBuilder }) {
  // Each certification present the same scores per user.
  // The "success" user answered the same successful answers to same questions regardless of the certification course.
  // Idem for the "failed" user, but in a "failed" way.
  const createdAt = new Date('2020-01-31T00:00:00Z');
  _.each(
    [
      ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID,
      ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
      ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID,
      ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID,
      ASSESSMENT_SUCCESS_PUBLISHED_SESSION_SCO_ID,
      ASSESSMENT_SUCCESS_EDU_PUBLISHED_SESSION_ID,
    ],
    (assessmentId) => {
      _buildSuccessScore(databaseBuilder, createdAt, assessmentId);
    },
  );
  _.each(
    [
      ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID,
      ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID,
      ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID,
      ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID,
    ],
    (assessmentId) => {
      _buildFailureScore(databaseBuilder, createdAt, assessmentId);
    });

  // Special case : build answers only, has for this one, the assessment has not been completed
  _buildAnswers({
    answerData: CERTIFICATION_SUCCESS_ANSWERS_DATA.slice(0, -1),
    databaseBuilder,
    assessmentId: ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID,
    createdAt,
  });
}

function _buildAnswers({ answerData, databaseBuilder, assessmentId, createdAt }) {
  let answerDate = createdAt;
  _.each(answerData, (answerData) => {
    databaseBuilder.factory.buildAnswer({ ...answerData, value: 'Dummy value', assessmentId, createdAt: answerDate });
    answerDate = _addTenSeconds(answerDate);
  });
}

function _addTenSeconds(date) {
  const returnedDate = new Date(date);
  returnedDate.setSeconds(returnedDate.getSeconds() + 10);
  return returnedDate;
}

function _buildSuccessScore(databaseBuilder, createdAt, assessmentId) {
  _buildAnswers({ answerData: CERTIFICATION_SUCCESS_ANSWERS_DATA, databaseBuilder, assessmentId, createdAt });
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    level: null, pixScore: 518, emitter: 'PIX-ALGO', status: 'validated', commentForJury: null,
    commentForCandidate: null, commentForOrganization: null, juryId: null, assessmentId, createdAt,
  }).id;
  _.each(CERTIFICATION_SUCCESS_COMPETENCE_MARKS_DATA, (competenceMarkData) => {
    databaseBuilder.factory.buildCompetenceMark({ ...competenceMarkData, assessmentResultId, createdAt });
  });
}

function _buildFailureScore(databaseBuilder, createdAt, assessmentId) {
  _buildAnswers({ answerData: CERTIFICATION_FAILURE_ANSWERS_DATA, databaseBuilder, assessmentId, createdAt });
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    level: -1, pixScore: 0, emitter: 'PIX-ALGO', status: 'rejected', commentForJury: null,
    commentForCandidate: null, commentForOrganization: null, juryId: null, assessmentId, createdAt,
  }).id;
  _.each(CERTIFICATION_FAILURE_COMPETENCE_MARKS_DATA, (competenceMarkData) => {
    databaseBuilder.factory.buildCompetenceMark({ ...competenceMarkData, assessmentResultId, createdAt });
  });
}

export default certificationScoresBuilder;
