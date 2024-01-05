import { applyEmberDataSerializers, discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer } from 'miragejs';

import getAreas from './routes/get-areas';
import getCampaigns from './routes/get-campaigns';
import getCertificationCandidatesSubscriptions from './routes/get-certification-candidates-subscriptions';
import getCertification from './routes/get-certification';
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
import loadAuthenticationRoutes from './routes/authentication/index';
import loadOidcAuthenticationRoutes from './routes/authentication/oidc/index';
import loadCampaignParticipations from './routes/campaign-participations/index';
import loadCertificationCourseRoutes from './routes/certification-courses/index';
import loadCourseRoutes from './routes/courses/index';
import loadPasswordResetDemandRoutes from './routes/password-reset-demands/index';
import loadOrganizationLearnersRoutes from './routes/organization-learners/index';
import loadScoOrganizationLearnersRoutes from './routes/sco-organization-learners/index';
import loadSupOrganizationLearnersRoutes from './routes/sup-organization-learners/index';
import loadAccountRecoveryRoutes from './routes/account-recovery/index';
import loadUserRoutes from './routes/users/index';
import putUserSavedTutorial from './routes/put-user-saved-tutorial';
import deleteUserSavedTutorial from './routes/delete-user-saved-tutorial';
import putTutorialEvaluation from './routes/put-tutorial-evaluation';
import postSharedCertifications from './routes/post-shared-certifications';
import loadUserTutorialsRoutes from './routes/get-user-tutorials';
import loadModuleRoutes from './routes/modules/index';

export default function makeServer(config) {
  const finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(config.store), ...config.models },
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
    logging: true,
    urlPrefix: 'http://localhost:3000',
  };

  return createServer(finalConfig);
}

/* eslint max-statements: off */
function routes() {
  this.namespace = 'api';
  this.timing = 0; // response delay

  loadAnswerRoutes(this);
  loadAssessmentRoutes(this);
  loadAuthenticationRoutes(this);
  loadOidcAuthenticationRoutes(this);
  loadCampaignParticipations(this);
  loadCertificationCourseRoutes(this);
  loadCourseRoutes(this);
  loadPasswordResetDemandRoutes(this);
  loadOrganizationLearnersRoutes(this);
  loadScoOrganizationLearnersRoutes(this);
  loadSupOrganizationLearnersRoutes(this);
  loadUserRoutes(this);
  loadAccountRecoveryRoutes(this);
  loadUserTutorialsRoutes(this);
  loadModuleRoutes(this);

  this.get('/assessments/:id/competence-evaluations', getCompetenceEvaluationsByAssessment);

  this.get('/campaigns', getCampaigns);

  this.get('/certifications', getCertifications);
  this.get('/certifications/:id', getCertification);

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.post('/competence-evaluations/start-or-resume', postCompetenceEvaluation);

  this.get('/frameworks/pix/areas-for-user', getAreas);

  this.get('/progressions/:id', getProgression);

  this.get('/scorecards/:id', getScorecard);
  this.get('/scorecards/:id/tutorials', getScorecardsTutorials);

  this.post('/sessions/:id/candidate-participation', postSessionParticipation);

  this.post('/expired-password-updates', postExpiredPasswordUpdates);

  this.put('/users/tutorials/:tutorialId', putUserSavedTutorial);
  this.del('/users/tutorials/:tutorialId', deleteUserSavedTutorial);
  this.put('/users/tutorials/:tutorialId/evaluate', putTutorialEvaluation);

  this.get('/feature-toggles', getFeatureToggles);

  this.post('/shared-certifications', postSharedCertifications);

  this.get('/certification-candidates/:id/subscriptions', getCertificationCandidatesSubscriptions);

  this.get('/certification-courses/:id');
}
