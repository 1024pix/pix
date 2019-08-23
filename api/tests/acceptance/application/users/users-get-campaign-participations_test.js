const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | GET /user/id/campaign-participations', () => {

  let userId;
  let campaign1;
  let campaign2;
  let campaignParticipation1;
  let campaignParticipation2;
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/:id/campaign-participations', () => {

    function _options(userId) {
      return {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
    }

    beforeEach(() => {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;

      campaign1 = databaseBuilder.factory.buildCampaign();
      const oldDate = new Date('2018-02-03T01:02:03Z');
      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign1.id,
        createdAt: oldDate,
      });

      campaign2 = databaseBuilder.factory.buildCampaign();
      const recentDate = new Date('2018-05-06T01:02:03Z');
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign2.id,
        createdAt: recentDate,
      });
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return found campaign-participations with 200 HTTP status code', () => {
      // when
      const promise = server.inject(_options(userId));

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'campaign-participations',
              id: campaignParticipation2.id.toString(),
              attributes: {
                'is-shared': campaignParticipation2.isShared,
                'participant-external-id': campaignParticipation2.participantExternalId,
                'shared-at': campaignParticipation2.sharedAt,
                'created-at': campaignParticipation2.createdAt
              },
              relationships: {
                campaign: {
                  data:
                    { type: 'campaigns', id: `${campaign2.id}` },
                },
                user: {
                  data: null
                },
                assessment: {
                  links: {
                    related: `/api/assessments/${campaignParticipation2.assessmentId}`
                  }
                },
                'campaign-participation-result': {
                  links: {
                    'related': `/api/campaign-participations/${campaignParticipation2.id}/campaign-participation-result`
                  }
                },
              },
            },
            {
              type: 'campaign-participations',
              id: campaignParticipation1.id.toString(),
              attributes: {
                'is-shared': campaignParticipation1.isShared,
                'participant-external-id': campaignParticipation1.participantExternalId,
                'shared-at': campaignParticipation1.sharedAt,
                'created-at': campaignParticipation1.createdAt
              },
              relationships: {
                campaign: {
                  data:
                    { type: 'campaigns', id: `${campaign1.id}` },
                },
                user: {
                  data: null
                },
                assessment: {
                  links: {
                    related: `/api/assessments/${campaignParticipation1.assessmentId}`
                  }
                },
                'campaign-participation-result': {
                  links: {
                    'related': `/api/campaign-participations/${campaignParticipation1.id}/campaign-participation-result`
                  }
                }
              },
            },
          ],
          included: [
            {
              type: 'campaigns',
              id: campaign2.id.toString(),
              attributes: {
                code: campaign2.code,
                title: campaign2.title,
              }
            },
            {
              type: 'campaigns',
              id: campaign1.id.toString(),
              attributes: {
                code: campaign1.code,
                title: campaign1.title,
              }
            },
          ],
        });
      });
    });
  });
});
