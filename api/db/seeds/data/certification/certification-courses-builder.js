const _ = require('lodash');
const {
  CERTIF_SUCCESS_USER_ID,
  CERTIF_SCO_STUDENT_ID,
  CERTIF_FAILURE_USER_ID,
  CERTIF_REGULAR_USER5_ID,
} = require('./users');
const {
  TO_FINALIZE_SESSION_ID,
  NO_PROBLEM_FINALIZED_SESSION_ID,
  PROBLEMS_FINALIZED_SESSION_ID,
  PUBLISHED_SESSION_ID,
  PUBLISHED_SCO_SESSION_ID,
} = require('./certification-sessions-builder');
const {
  CANDIDATE_DATA_SUCCESS,
  CANDIDATE_DATA_FAILURE,
  CANDIDATE_DATA_STARTED,
  CANDIDATE_SCO_DATA_SUCCESS,
} = require('./certification-candidates-builder');
const { CERTIFICATION_CHALLENGES_DATA } = require('./certification-data');
const { CertificationIssueReportCategories } = require('./../../../../lib/domain/models/CertificationIssueReportCategory');

const ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID = 100;
const ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID = 101;
const ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID = 102;
const ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID = 103;
const ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID = 104;
const ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID = 105;
const ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID = 106;
const ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID = 107;
const ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID = 108;
const ASSESSMENT_SUCCESS_PUBLISHED_SESSION_SCO_ID = 109;
const CERTIFICATION_COURSE_SUCCESS_ID = 200;
const CERTIFICATION_COURSE_FAILURE_ID = 403;

function certificationCoursesBuilder({ databaseBuilder }) {
  // Each certification tests present the same questions
  _.each([
    { userId: CERTIF_SUCCESS_USER_ID, sessionId: TO_FINALIZE_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_IN_SESSION_TO_FINALIZE_ID, candidateData: CANDIDATE_DATA_SUCCESS, examinerComment: null, hasSeenEndTestScreen: false, isPublished: false, verificationCode: null },
    { userId: CERTIF_FAILURE_USER_ID, sessionId: TO_FINALIZE_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_IN_SESSION_TO_FINALIZE_ID, candidateData: CANDIDATE_DATA_FAILURE, examinerComment: null, hasSeenEndTestScreen: false, isPublished: false, verificationCode: null },
    { userId: CERTIF_SCO_STUDENT_ID, sessionId: PUBLISHED_SCO_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_PUBLISHED_SESSION_SCO_ID, candidateData: CANDIDATE_SCO_DATA_SUCCESS, examinerComment: null, hasSeenEndTestScreen: true, isPublished: true, verificationCode: null },
    { userId: CERTIF_SUCCESS_USER_ID, sessionId: NO_PROBLEM_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_IN_NO_PROBLEM_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_SUCCESS, examinerComment: null, hasSeenEndTestScreen: true, isPublished: false, verificationCode: null },
    { userId: CERTIF_FAILURE_USER_ID, sessionId: NO_PROBLEM_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_IN_NO_PROBLEM_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_FAILURE, examinerComment: null, hasSeenEndTestScreen: true, isPublished: false, verificationCode: null },
    { userId: CERTIF_SUCCESS_USER_ID, sessionId: PROBLEMS_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_IN_PROBLEMS_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_SUCCESS, examinerComment: 'A regardé son téléphone pendant le test', hasSeenEndTestScreen: true, isPublished: false, verificationCode: null },
    { userId: CERTIF_FAILURE_USER_ID, sessionId: PROBLEMS_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_IN_PROBLEMS_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_FAILURE, examinerComment: 'Son ordinateur a explosé', hasSeenEndTestScreen: false, isPublished: false, verificationCode: null },
    { userId: CERTIF_REGULAR_USER5_ID, sessionId: PROBLEMS_FINALIZED_SESSION_ID, assessmentId: ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID, candidateData: CANDIDATE_DATA_STARTED, examinerComment: 'Elle a pas finis sa certif', hasSeenEndTestScreen: false, isPublished: false, verificationCode: null },
    { id: CERTIFICATION_COURSE_SUCCESS_ID, userId: CERTIF_SUCCESS_USER_ID, sessionId: PUBLISHED_SESSION_ID, assessmentId: ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID, candidateData: CANDIDATE_DATA_SUCCESS, hasSeenEndTestScreen: true, isPublished: true, verificationCode: null },
    { id: CERTIFICATION_COURSE_FAILURE_ID, userId: CERTIF_FAILURE_USER_ID, sessionId: PUBLISHED_SESSION_ID, assessmentId: ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID, candidateData: CANDIDATE_DATA_FAILURE, hasSeenEndTestScreen: true, isPublished: true, verificationCode: null },
  ], (certificationCourseData) => {
    _buildCertificationCourse(databaseBuilder, certificationCourseData);
  });
}

function _buildCertificationCourse(databaseBuilder, { id, assessmentId, userId, sessionId, candidateData, examinerComment, hasSeenEndTestScreen, isPublished, verificationCode }) {
  const createdAt = new Date('2020-01-31T00:00:00Z');
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    ...candidateData, id, createdAt, isPublished, isV2Certification: true, examinerComment, hasSeenEndTestScreen, sessionId, userId, verificationCode,
  }).id;
  if (examinerComment) {
    databaseBuilder.factory.buildCertificationIssueReport({
      certificationCourseId,
      category: CertificationIssueReportCategories.OTHER,
      description: examinerComment,
    });
  }
  databaseBuilder.factory.buildAssessment({
    id: assessmentId, certificationCourseId, type: 'CERTIFICATION', state: 'completed', userId, competenceId: null,
    campaignParticipationId: null, isImproving: false, createdAt,
  });
  _.each(CERTIFICATION_CHALLENGES_DATA, (challenge) => {
    databaseBuilder.factory.buildCertificationChallenge({ ...challenge, courseId: certificationCourseId, associatedSkillId: null, createdAt });
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
  ASSESSMENT_STARTED_IN_PROBLEMS_FINALIZED_SESSION_ID,
  ASSESSMENT_SUCCESS_PUBLISHED_SESSION_ID,
  ASSESSMENT_FAILURE_PUBLISHED_SESSION_ID,
  ASSESSMENT_SUCCESS_PUBLISHED_SESSION_SCO_ID,
  CERTIFICATION_COURSE_FAILURE_ID,
  CERTIFICATION_COURSE_SUCCESS_ID,
} ;
