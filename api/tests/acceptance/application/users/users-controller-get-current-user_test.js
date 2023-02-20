import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | users-controller-get-current-user', function () {
  let options;
  let server;
  let user;
  let expectedCode;

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser();
    const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'SOMECODE' });
    const assessmentCampaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
    expectedCode = campaign.code;
    const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      status: 'TO_SHARE',
      userId: user.id,
    });
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId: assessmentCampaign.id,
      userId: user.id,
    });
    const { id: trainingId } = databaseBuilder.factory.buildTraining();
    databaseBuilder.factory.buildUserRecommendedTraining({ userId: user.id, trainingId, campaignParticipationId });

    options = {
      method: 'GET',
      url: '/api/users/me',
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('GET /users/me', function () {
    it('should return found user with 200 HTTP status code', async function () {
      // given
      const expectedUserJSONApi = {
        data: {
          type: 'users',
          id: user.id.toString(),
          attributes: {
            'first-name': user.firstName,
            'last-name': user.lastName,
            email: user.email.toLowerCase(),
            username: user.username,
            cgu: user.cgu,
            lang: 'fr',
            'is-anonymous': false,
            'last-terms-of-service-validated-at': user.lastTermsOfServiceValidatedAt,
            'must-validate-terms-of-service': user.mustValidateTermsOfService,
            'pix-orga-terms-of-service-accepted': user.pixOrgaTermsOfServiceAccepted,
            'pix-certif-terms-of-service-accepted': user.pixCertifTermsOfServiceAccepted,
            'has-seen-assessment-instructions': user.hasSeenAssessmentInstructions,
            'has-seen-new-dashboard-info': user.hasSeenNewDashboardInfo,
            'has-seen-focused-challenge-tooltip': user.hasSeenFocusedChallengeTooltip,
            'has-seen-other-challenges-tooltip': user.hasSeenOtherChallengesTooltip,
            'has-assessment-participations': true,
            'code-for-last-profile-to-share': expectedCode,
            'has-recommended-trainings': true,
            'should-see-data-protection-policy-information-banner': true,
            'last-data-protection-policy-seen-at': null,
          },
          relationships: {
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
