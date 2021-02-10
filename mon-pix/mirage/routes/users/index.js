import { Response } from 'ember-cli-mirage';
import getAuthenticatedUser from './get-authenticated-user';
import isCertifiable from './is-certifiable';
import getScorecards from './get-scorecards';
import getProfile from './get-profile';
import getUserCampaignParticipations from './get-user-campaign-participations';
import getUserCampaignParticipationOverviews from './get-user-campaign-participation-overviews';
import getUserCampaignParticipationToCampaign from './get-user-campaign-participation-to-campaign';
import getUserSharedProfileForCampaign from './get-user-shared-profile-for-campaign';
import resetScorecard from './reset-scorecard';

export default function index(config) {
  config.get('/users/me', getAuthenticatedUser);

  config.post('/users');
  config.post('/users/:id/competences/:competenceId/reset', resetScorecard);

  config.get('/users/:userId/campaigns/:campaignId/campaign-participations', getUserCampaignParticipationToCampaign);
  config.get('/users/:userId/campaigns/:campaignId/profile', getUserSharedProfileForCampaign);
  config.get('/users/:id/is-certifiable', isCertifiable);
  config.get('/users/:id/scorecards', getScorecards);
  config.get('/users/:id/profile', getProfile);
  config.get('/users/:id/campaign-participations', getUserCampaignParticipations);
  config.get('/users/:id/campaign-participation-overviews', getUserCampaignParticipationOverviews);

  config.patch('/users/:id/email', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const user = schema.users.find(request.params.id);
    if (user.password !== body.data.attributes.password) {
      return new Response(400);
    }
    user.update({ email: body.data.attributes.email });
    return new Response(204);
  });

  config.patch('/users/:id/password-update', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const user = schema.users.find(request.params.id);

    const demand = schema.passwordResetDemands.findBy({ temporaryKey: request.queryParams['temporary-key'] });
    if (user.email !== demand.email) {
      return new Response(401);
    } else {
      user.update({ password: body.data.attributes.password });
      return new Response(204);
    }
  });
  config.patch('/users/:id/remember-user-has-seen-assessment-instructions', (schema, request) => {
    const user = schema.users.find(request.params.id);
    user.update({ hasSeenAssessmentInstructions: true });
    return user;
  });

  config.patch('/users/:id/has-seen-new-dashboard-info', (schema, request) => {
    const user = schema.users.find(request.params.id);
    user.update({ hasSeenNewDashboardInfo: true });
    return user;
  });
}
