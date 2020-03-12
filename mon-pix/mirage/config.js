import findAssessments from './routes/find-assessments';
import getAnswer from './routes/get-answer';
import getAnswerByChallengeAndAssessment from './routes/get-answer-by-challenge-and-assessment';
import getAssessment from './routes/get-assessment';
import getCampaignParticipation from './routes/get-campaign-participation';
import getCampaignParticipationResult from './routes/get-campaign-participation-result';
import getCampaigns from './routes/get-campaigns';
import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getNextChallenge from './routes/get-next-challenge';
import getScorecard from './routes/get-scorecard';
import getScorecardsTutorials from './routes/get-scorecards-tutorials';
import patchAnswer from './routes/patch-answer';
import patchCampaignParticipation from './routes/patch-campaign-participation';
import postAnswers from './routes/post-answers';
import postAssessments from './routes/post-assessments';
import postCampaignParticipation from './routes/post-campaign-participation';
import postCompetenceEvaluation from './routes/post-competence-evaluation';
import postSessionParticipation from './routes/post-session-participation';
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

  loadAuthRoutes(this);
  loadCertificationCourseRoutes(this);
  loadCourseRoutes(this);
  loadPasswordResetDemandRoutes(this);
  loadStudentDependentUserRoutes(this);
  loadStudentUserAssociationRoutes(this);
  loadUserRoutes(this);

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.post('/assessments', postAssessments);
  this.get('/assessments/:id', getAssessment);
  this.get('/assessments/:assessmentId/next', getNextChallenge);
  this.get('/assessments/:assessmentId/next?tryImproving', getNextChallenge);
  this.get('/assessments', findAssessments);
  this.patch('/assessments/:id/complete-assessment', getAssessment);

  this.post('/answers', postAnswers);
  this.get('/answers/:id', getAnswer);
  this.get('/answers', getAnswerByChallengeAndAssessment);
  this.patch('/answers/:id', patchAnswer);

  this.get('/certifications');

  this.post('/sessions/:id/candidate-participation', postSessionParticipation);

  this.get('/scorecards/:id', getScorecard);
  this.get('/scorecards/:id/tutorials', getScorecardsTutorials);

  this.del('/cache', () => null, 204);

  this.get('/progressions/:id');
  this.get('/campaigns', getCampaigns);
  this.post('/campaign-participations', postCampaignParticipation);
  this.get('/campaign-participations', getCampaignParticipation);
  this.patch('/campaign-participations/:id', patchCampaignParticipation);
  this.get('/campaign-participations/:id/campaign-participation-result', getCampaignParticipationResult);
  this.get('/campaigns/:id?include=targetProfile', (schema, request) => {
    return schema.campaigns.find(request.params['id?include=targetProfile']);
  });

  this.get('/competence-evaluations');
  this.post('/competence-evaluations/start-or-resume', postCompetenceEvaluation);
}
