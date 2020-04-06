import { Response } from 'ember-cli-mirage';
import getAuthenticatedUser from './get-authenticated-user';
import getCertificationProfile from './get-certification-profile';
import getPixScore from './get-pix-score';
import getScorecards from './get-scorecards';
import getUserCampaignParticipations from './get-user-campaign-participations';
import getUserCampaignParticipationToCampaign from './get-user-campaign-participation-to-campaign';
import resetScorecard from './reset-scorecard';

export default function index(config) {
  config.post('/users');

  config.get('/users/:userId/campaigns/:campaignId/campaign-participations', getUserCampaignParticipationToCampaign);
  config.get('/users/:id/certification-profile', getCertificationProfile);
  config.get('/users/:id/pixscore', getPixScore);
  config.get('/users/:id/scorecards', getScorecards);
  config.get('/users/:id/campaign-participations', getUserCampaignParticipations);
  config.patch('/users/:id/password-update', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const user =  schema.users.find(request.params.id);

    const demand = schema.passwordResetDemands.findBy({ temporaryKey: request.queryParams['temporary-key'] });
    if (user.email !== demand.email) {
      return new Response(401);
    } else {
      user.update({ password: body.data.attributes.password });
      return new Response(204);
    }
  });
  config.patch('/users/:id/remember-user-has-seen-assessment-instructions', (schema, request) => {
    const user =  schema.users.find(request.params.id);
    user.hasSeenAssessmentInstructions = true;
    return user;
  });

  config.post('/users/:id/competences/:competenceId/reset', resetScorecard);

  config.get('/users/me', getAuthenticatedUser);
}
