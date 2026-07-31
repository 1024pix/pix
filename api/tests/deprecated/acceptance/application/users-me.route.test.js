import { createServer } from '../../../../server.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Deprecated | Acceptance | Application | Route | User', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/users/me', function () {
    let options;
    let user;
    let expectedCode;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'SOMECODE' });
      const assessmentCampaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
      expectedCode = campaign.code;
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: 'STARTED',
        userId: user.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
      });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: assessmentCampaign.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation.id,
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
      });
      const { id: trainingId } = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildUserRecommendedTraining({ userId: user.id, trainingId, campaignParticipationId });

      options = {
        method: 'GET',
        url: '/api/users/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      return databaseBuilder.commit();
    });

    it('returns found user with 200 HTTP status code', async function () {
      // given
      const expectedUserJSONApi = {
        data: {
          type: 'users',
          id: user.id.toString(),
          attributes: {
            'first-name': user.firstName,
            'last-name': user.lastName,
            email: user.email.toLowerCase(),
            'email-confirmed': false,
            username: user.username,
            cgu: user.cgu,
            lang: 'fr',
            'is-anonymous': false,
            'last-terms-of-service-validated-at': user.lastTermsOfServiceValidatedAt,
            'must-validate-terms-of-service': user.mustValidateTermsOfService,
            'has-seen-assessment-instructions': user.hasSeenAssessmentInstructions,
            'has-seen-new-dashboard-info': user.hasSeenNewDashboardInfo,
            'has-seen-focused-challenge-tooltip': user.hasSeenFocusedChallengeTooltip,
            'has-seen-other-challenges-tooltip': user.hasSeenOtherChallengesTooltip,
            'has-assessment-participations': true,
            'code-for-last-profile-to-share': expectedCode,
            'has-recommended-trainings': true,
            'should-see-data-protection-policy-information-banner': true,
            'last-data-protection-policy-seen-at': null,
            'pix-app-terms-of-service-status': 'accepted',
            'pix-app-terms-of-service-document-path': null,
          },
          relationships: {
            'account-info': {
              links: {
                related: '/api/users/my-account',
              },
            },
            profile: {
              links: {
                related: `/api/users/${user.id}/profile`,
              },
            },
            'is-certifiable': {
              links: {
                related: `/api/users/${user.id}/is-certifiable`,
              },
            },
            trainings: {
              links: {
                related: `/api/users/${user.id}/trainings`,
              },
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedUserJSONApi);
    });
  });
});
