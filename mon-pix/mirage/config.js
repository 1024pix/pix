import getCampaignParticipation from './routes/get-campaign-participation';
import getCampaignParticipationResult from './routes/get-campaign-participation-result';
import getCampaigns from './routes/get-campaigns';
import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getScorecard from './routes/get-scorecard';
import getScorecardsTutorials from './routes/get-scorecards-tutorials';
import patchCampaignParticipation from './routes/patch-campaign-participation';
import postCampaignParticipation from './routes/post-campaign-participation';
import postCompetenceEvaluation from './routes/post-competence-evaluation';
import postSessionParticipation from './routes/post-session-participation';
import loadAnswerRoutes from './routes/answers/index';
import loadAssessmentRoutes from './routes/assessments/index';
import loadAuthRoutes from './routes/auth/index';
import loadCertificationCourseRoutes from './routes/certification-courses/index';
import loadCourseRoutes from './routes/courses/index';
import loadPasswordResetDemandRoutes from './routes/password-reset-demands/index';
import loadStudentDependentUserRoutes from './routes/student-dependent-users/index';
import loadStudentUserAssociationRoutes from './routes/student-user-associations/index';
import loadUserRoutes from './routes/users/index';

/* eslint max-statements: off */
export default function() {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0; // response delay

  loadAnswerRoutes(this);
  loadAssessmentRoutes(this);
  loadAuthRoutes(this);
  loadCertificationCourseRoutes(this);
  loadCourseRoutes(this);
  loadPasswordResetDemandRoutes(this);
  loadStudentDependentUserRoutes(this);
  loadStudentUserAssociationRoutes(this);
  loadUserRoutes(this);

  this.del('/cache', () => null, 204);

  this.get('/campaigns', getCampaigns);
  this.get('/campaigns/:id?include=targetProfile', (schema, request) => {
    return schema.campaigns.find(request.params['id?include=targetProfile']);
  });

  this.post('/campaign-participations', postCampaignParticipation);
  this.get('/campaign-participations', getCampaignParticipation);
  this.patch('/campaign-participations/:id', patchCampaignParticipation);
  this.get('/campaign-participations/:id/campaign-participation-result', getCampaignParticipationResult);

  this.get('/certifications');

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.get('/competence-evaluations');
  this.post('/competence-evaluations/start-or-resume', postCompetenceEvaluation);

  this.get('/progressions/:id');

  this.get('/scorecards/:id', getScorecard);
  this.get('/scorecards/:id/tutorials', getScorecardsTutorials);

  this.post('/sessions/:id/candidate-participation', postSessionParticipation);
}
