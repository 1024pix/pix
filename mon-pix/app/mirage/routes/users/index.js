import { Response } from 'miragejs';

import findPaginatedUserTrainings from './find-paginated-user-trainings';
import getAnonymisedCampaignAssessments from './get-anonymised-campaign-assessments';
import getAttestationDetails from './get-attestation-details';
import getAuthenticatedUser from './get-authenticated-user';
import getCampaignParticipationResult from './get-campaign-participation-result';
import getMyAccount from './get-my-account.js';
import getProfile from './get-profile';
import getScorecards from './get-scorecards';
import getUserCampaignParticipationOverviews from './get-user-campaign-participation-overviews';
import getUserCampaignParticipationToCampaign from './get-user-campaign-participation-to-campaign';
import getUserCampaignParticipations from './get-user-campaign-participations';
import getUserSharedProfileForCampaign from './get-user-shared-profile-for-campaign';
import isCertifiable from './is-certifiable';
import patchTermsOfServiceAcceptance from './patch-terms-of-service-acceptance';
import putUpdateEmail from './put-update-email';
import putVerificationCode from './put-verification-code';
import resetScorecard from './reset-scorecard';

export default function index(config) {
  config.get('/users/me', getAuthenticatedUser);

  config.get('/users/my-account', getMyAccount);

  config.post('/users', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const firstName = params.data.attributes['first-name'];
    const lastName = params.data.attributes['first-name'];
    const email = params.data.attributes['email'];
    const password = params.data.attributes['password'];
    const locale = params.data.attributes['locale'];
    const cgu = params.data.attributes['cgu'];

    return schema.users.create({ id: '10000', firstName, lastName, email, password, cgu, locale });
  });

  config.post('/users/:id/competences/:competenceId/reset', resetScorecard);
  config.post('/users/:id/update-email', putUpdateEmail);

  config.patch('/users/:id/pix-terms-of-service-acceptance', patchTermsOfServiceAcceptance);

  config.put('/users/:id/email/verification-code', putVerificationCode);

  config.get('/users/:userId/campaigns/:campaignId/campaign-participations', getUserCampaignParticipationToCampaign);
  config.get('/users/:userId/campaigns/:campaignId/profile', getUserSharedProfileForCampaign);
  config.get('/users/:userId/campaigns/:campaignId/assessment-result', getCampaignParticipationResult);
  config.get('/users/:id/is-certifiable', isCertifiable);
  config.get('/users/:id/scorecards', getScorecards);
  config.get('/users/:id/profile', getProfile);
  config.get('/users/:id/attestation-details', getAttestationDetails);
  config.get('/users/:id/campaign-participations', getUserCampaignParticipations);
  config.get('/users/:id/campaign-participation-overviews', getUserCampaignParticipationOverviews);
  config.get('/users/:id/anonymised-campaign-assessments', getAnonymisedCampaignAssessments);
  config.get('/users/:id/trainings', findPaginatedUserTrainings);

  config.get('/users/:id/authentication-methods', (schema, request) => {
    return schema.authenticationMethods.where({ userId: request.params.id });
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

  config.patch('/users/:id/has-seen-challenge-tooltip/:challengeType', (schema, request) => {
    const user = schema.users.find(request.params.id);
    user.update({ tooltipChallengeType: request.params.challengeType });
    return user;
  });

  config.patch('/users/:id/has-seen-last-data-protection-policy-information', (schema, request) => {
    const user = schema.users.find(request.params.id);
    user.update({
      lastDataProtectionPolicySeenAt: new Date('2022-12-24'),
      shouldSeeDataProtectionPolicyInformationBanner: false,
    });
    return user;
  });
}
