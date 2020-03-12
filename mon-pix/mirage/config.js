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
import loadUserRoutes from './routes/users/index';
import loadCourseRoutes from './routes/courses/index';
import loadCertificationCourseRoutes from './routes/certification-courses/index';

import { Response } from 'ember-cli-mirage';

/* eslint max-statements: off */
export default function() {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0; // response delay

  loadAuthRoutes(this);
  loadCertificationCourseRoutes(this);
  loadCourseRoutes(this);
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

  this.post('/password-reset-demands', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const sentEmail = attrs.data.attributes.email;
    const matchingAccount = schema.users.findBy({ email: sentEmail });

    if (matchingAccount !== null) {
      return schema.passwordResetDemands.create({ email: sentEmail });
    } else {
      return new Response(400);
    }
  });

  this.get('/password-reset-demands/:key', (schema, request) => {
    const demand = schema.passwordResetDemands.findBy({ temporaryKey: request.params.key });
    return schema.users.findBy({ email: demand.email });
  });

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

  this.post('/student-user-associations', () => {
    return new Response(204);
  });

  this.put('/student-user-associations/possibilities', () => {
    return new Response(204);
  });

  this.post('/student-dependent-users', (schema, request) => {
    const params = JSON.parse(request.requestBody);

    const campaignCode = params.data.attributes['campaign-code'];
    const organizationId = schema.campaigns.findBy({ code: campaignCode }).organizationId;

    const firstName = params.data.attributes['first-name'];
    const lastName = params.data.attributes['last-name'];
    const newUser = {
      firstName,
      lastName,
      email: params.data.attributes['email'],
      username: params.data.attributes['username'],
      password: params.data.attributes['password'],
    };
    const student = schema.students.findBy({ firstName, lastName });
    const user = schema.users.create(newUser);
    student.update({ userId: user.id, organizationId });
    return user;
  });

  this.get('/student-user-associations', (schema, request) => {
    const userId =  request.queryParams.userId;
    const student = schema.students.findBy({ userId });
    return student ? student : { data: null };
  });
}
