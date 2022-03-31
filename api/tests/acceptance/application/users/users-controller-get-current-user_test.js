const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');

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
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      status: 'TO_SHARE',
      userId: user.id,
    });
    databaseBuilder.factory.buildCampaignParticipation({
      campaignId: assessmentCampaign.id,
      userId: user.id,
    });

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
            'has-seen-other-challenges-tooltip': user.hasSeenOtherChallengesTooltip,
            'has-assessment-participations': true,
            'code-for-last-profile-to-share': expectedCode,
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/users/${user.id}/memberships`,
              },
            },
            'certification-center-memberships': {
              links: {
                related: `/api/users/${user.id}/certification-center-memberships`,
              },
            },
            'pix-score': {
              links: {
                related: `/api/users/${user.id}/pixscore`,
              },
            },
            profile: {
              links: {
                related: `/api/users/${user.id}/profile`,
              },
            },
            scorecards: {
              links: {
                related: `/api/users/${user.id}/scorecards`,
              },
            },
            'is-certifiable': {
              links: {
                related: `/api/users/${user.id}/is-certifiable`,
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
