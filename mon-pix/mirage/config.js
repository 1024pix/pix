import getCampaigns from './routes/get-campaigns';
import getCertifications from './routes/get-certifications';
import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getCompetenceEvaluationsByAssessment from './routes/get-competence-evaluations-by-assessment';
import getFeatureToggles from './routes/get-feature-toggles';
import getProgression from './routes/get-progression';
import getScorecard from './routes/get-scorecard';
import getScorecardsTutorials from './routes/get-scorecards-tutorials';
import postCompetenceEvaluation from './routes/post-competence-evaluation';
import postSessionParticipation from './routes/post-session-participation';
import postExpiredPasswordUpdates from './routes/post-expired-password-updates';
import loadAnswerRoutes from './routes/answers/index';
import loadAssessmentRoutes from './routes/assessments/index';
import loadAuthRoutes from './routes/auth/index';
import loadCampaignParticipations from './routes/campaign-participations/index';
import loadCertificationCourseRoutes from './routes/certification-courses/index';
import loadCourseRoutes from './routes/courses/index';
import loadPasswordResetDemandRoutes from './routes/password-reset-demands/index';
import loadSchoolingRegistrationUserAssociationRoutes from './routes/schooling-registration-user-associations/index';
import loadSchoolingRegistrationDependentUserRoutes from './routes/schooling-registration-dependent-users/index';
import loadAccountRecoveryRoutes from './routes/account-recovery/index';
import loadUserRoutes from './routes/users/index';
import patchTermsOfServiceAcceptance from './routes/patch-terms-of-service-acceptance';
import putTutorialEvaluation from './routes/put-tutorial-evaluation';
import putUpdateEmail from './routes/put-update-email';
import putVerificationCode from './routes/put-verification-code';
import postPoleEmploiUser from './routes/post-pole-emploi-user';
import postSharedCertifications from './routes/post-shared-certifications';
import loadUserTutorialsRoutes from './routes/get-user-tutorials';
import loadSavedTutorialsRoutes from './routes/get-saved-tutorials';
import loadRecommendedTutorialsRoutes from './routes/get-recommended-tutorials';

/* eslint max-statements: off */
export default function () {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0; // response delay

  loadAnswerRoutes(this);
  loadAssessmentRoutes(this);
  loadAuthRoutes(this);
  loadCampaignParticipations(this);
  loadCertificationCourseRoutes(this);
  loadCourseRoutes(this);
  loadPasswordResetDemandRoutes(this);
  loadSchoolingRegistrationUserAssociationRoutes(this);
  loadSchoolingRegistrationDependentUserRoutes(this);
  loadUserRoutes(this);
  loadAccountRecoveryRoutes(this);
  loadUserTutorialsRoutes(this);
  loadSavedTutorialsRoutes(this);
  loadRecommendedTutorialsRoutes(this);

  this.get('/assessments/:id/competence-evaluations', getCompetenceEvaluationsByAssessment);

  this.get('/campaigns', getCampaigns);

  this.get('/certifications', getCertifications);

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.post('/competence-evaluations/start-or-resume', postCompetenceEvaluation);

  this.get('/progressions/:id', getProgression);

  this.get('/scorecards/:id', getScorecard);
  this.get('/scorecards/:id/tutorials', getScorecardsTutorials);

  this.post('/sessions/:id/candidate-participation', postSessionParticipation);

  this.post('/expired-password-updates', postExpiredPasswordUpdates);

  this.put('/users/tutorials/:tutorialId/evaluate', putTutorialEvaluation);

  this.put('/users/:id/email/verification-code', putVerificationCode);

  this.post('/users/:id/update-email', putUpdateEmail);

  this.patch('/users/:id/pix-terms-of-service-acceptance', patchTermsOfServiceAcceptance);

  this.post('/pole-emplois/users', postPoleEmploiUser);

  this.get('/feature-toggles', getFeatureToggles);

  this.post('/shared-certifications', postSharedCertifications);

  this.get('/certification-candidates/:id/subscriptions', (schema, request) => {
    const certificationCandidateId = request.params.id;
    return schema.certificationCandidateSubscriptions.find(certificationCandidateId);
  });

  this.get('/certification-courses/:id');
}
