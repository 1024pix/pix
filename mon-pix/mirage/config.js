import findAssessments from './routes/find-assessments';
import getAnswer from './routes/get-answer';
import getAnswerByChallengeAndAssessment from './routes/get-answer-by-challenge-and-assessment';
import getAssessment from './routes/get-assessment';
import getAuthenticatedUser from './routes/get-user-me';
import getCampaignParticipation from './routes/get-campaign-participation';
import getCampaignParticipationResult from './routes/get-campaign-participation-result';
import getCampaigns from './routes/get-campaigns';
import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getCorrections from './routes/get-corrections';
import getCourse from './routes/get-course';
import getCourses from './routes/get-courses';
import getNextChallenge from './routes/get-next-challenge';
import getOrganizations from './routes/get-organizations';
import getPixScore from './routes/get-pix-score';
import getScorecard from './routes/get-scorecard';
import getScorecards from './routes/get-scorecards';
import getSnapshots from './routes/get-snapshots';
import getUserCampaignParticipations from './routes/get-user-campaign-participations';
import patchAnswer from './routes/patch-answer';
import patchCampaignParticipation from './routes/patch-campaign-participation';
import postAnswers from './routes/post-answers';
import postAssessments from './routes/post-assessments';
import postAuthentications from './routes/post-authentications';
import postCampaignParticipation from './routes/post-campaign-participation';
import postCertificationCourse from './routes/post-certification-course';
import postCompetenceEvaluation from './routes/post-competence-evaluation';
import postFeedbacks from './routes/post-feedbacks';
import resetScorecard from './routes/reset-scorecard';

import { Response } from 'ember-cli-mirage';

/* eslint max-statements: off */
export default function() {
  this.logging = true;
  this.passthrough('/write-coverage');
  this.post('https://fonts.googleapis.com/**', () => {
  });

  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0; // response delay

  this.get('/courses', getCourses);

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.post('/assessments', postAssessments);
  this.get('/assessments/:id', getAssessment);
  this.get('/assessments/:assessmentId/next', getNextChallenge);

  this.post('/answers', postAnswers);
  this.get('/answers/:id', getAnswer);
  this.get('/answers', getAnswerByChallengeAndAssessment);
  this.patch('/answers/:id', patchAnswer);

  this.post('/feedbacks', postFeedbacks);

  //Nouveau Mirage

  this.get('/assessments', findAssessments);

  this.get('/courses/:id', getCourse);
  this.post('/courses', postCertificationCourse);

  this.get('/certifications');

  this.post('/authentications', postAuthentications);
  this.get('/users/me', getAuthenticatedUser);
  this.get('/users/me/profile', getAuthenticatedUser);
  this.get('/users/:id/pixscore', getPixScore);
  this.get('/users/:id/scorecards', getScorecards);
  this.get('/users/:id/campaign-participations', getUserCampaignParticipations);
  this.post('/users/:userId/competences/:competenceId/reset', resetScorecard);
  this.get('/scorecards/:id', getScorecard);
  this.get('/competences/:id');
  this.get('/areas/:id');
  this.get('/organizations/:id');

  this.get('/organizations', getOrganizations);

  this.get('/corrections', getCorrections);

  this.post('/snapshots');
  this.get('/snapshots/:id');
  this.get('/snapshots', getSnapshots);

  this.post('/users');
  this.patch('/users/:id', getAuthenticatedUser);
  this.post('/assessment-results');

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
    const user = schema.users.findBy({ email: demand.email });
    return user;
  });

  this.patch('/users/:id', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const demand = schema.passwordResetDemands.findBy({ temporaryKey: request.queryParams['temporary-key'] });
    const user =  schema.users.find(request.params.id);
    if (user.email !== demand.email) {
      return new Response(401);
    } else {
      user.update({ password: body.data.attributes.password });
      return new Response(204);
    }
  });

  this.get('/progressions/:id');
  this.get('/campaigns', getCampaigns);
  this.post('/campaign-participations', postCampaignParticipation);
  this.get('/campaign-participations', getCampaignParticipation);
  this.patch('/campaign-participations/:id', patchCampaignParticipation);
  this.get('/campaign-participations/:id/campaign-participation-result', getCampaignParticipationResult);

  this.get('/competence-evaluations');
  this.post('/competence-evaluations/start-or-resume', postCompetenceEvaluation);
}
