import getCampaignParticipationResult from './routes/get-campaign-participation-result';
import getCampaigns from './routes/get-campaigns';
import getCertifications from './routes/get-certifications';
import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getCompetenceEvaluations from './routes/get-competence-evaluations';
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
import loadUserRoutes from './routes/users/index';
import putTutorialEvaluation from './routes/put-tutorial-evaluation';
import postSharedCertifications from './routes/post-shared-certifications';

/* eslint max-statements: off */
export default function() {
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

  this.get('/campaigns', getCampaigns);
  this.get('/campaigns/:id?include=targetProfile', (schema, request) => {
    return schema.campaigns.find(request.params['id?include=targetProfile']);
  });

  this.get('/campaign-participations/:id/campaign-participation-result', getCampaignParticipationResult);

  this.get('/certifications', getCertifications);

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.get('/competence-evaluations', getCompetenceEvaluations);
  this.post('/competence-evaluations/start-or-resume', postCompetenceEvaluation);

  this.get('/progressions/:id', getProgression);

  this.get('/scorecards/:id', getScorecard);
  this.get('/scorecards/:id/tutorials', getScorecardsTutorials);

  this.post('/sessions/:id/candidate-participation', postSessionParticipation);

  this.post('/expired-password-updates', postExpiredPasswordUpdates);

  this.put('/users/tutorials/:tutorialId/evaluate', putTutorialEvaluation);

  this.patch('/users/:id/pix-terms-of-service-acceptance', (schema, request) => {
    const userId = request.params.id;
    const user = schema.users.find(userId);
    user.update({ mustValidateTermsOfService: false, lastTermsOfServiceValidatedAt: '2020-06-06' });

    return user;
  });

  this.get('/feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.post('/shared-certifications', postSharedCertifications);
}
