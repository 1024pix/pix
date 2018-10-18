const { expect, generateValidRequestAuhorizationHeader, databaseBuilder } = require('../../../test-helper');
const server = require('../../../../server');

describe('Acceptance | Route | GET /user/id/campaign-participations', () => {

  let userId;
  let campaign1;
  let campaign2;
  let campaignParticipation1;
  let campaignParticipation2;
  describe('GET /users/:id/campaign-participations', () => {

    function _options(userId) {
      return {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participations`,
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
    }

    beforeEach(() => {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;

      campaign1 = databaseBuilder.factory.buildCampaign();
      const oldDate = new Date('2018-02-03');
      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign1.id,
        createdAt: oldDate,
      });

      campaign2 = databaseBuilder.factory.buildCampaign();
      const recentDate = new Date('2018-05-06');
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
              id: campaignParticipation2.id,
              attributes: {
                'is-shared': campaignParticipation2.isShared,
                'shared-at': campaignParticipation2.sharedAt,
                'created-at': campaignParticipation2.createdAt
              },
              relationships: {
                campaign: {
                  data:
                    { type: 'campaigns', id: `${campaign2.id}` },
                },
                assessment: {
                  data:
                    { type: 'assessments', id: `${campaignParticipation2.assessmentId}` },
                },
              },
            },
            {
              type: 'campaign-participations',
              id: campaignParticipation1.id,
              attributes: {
                'is-shared': campaignParticipation1.isShared,
                'shared-at': campaignParticipation1.sharedAt,
                'created-at': campaignParticipation1.createdAt
              },
              relationships: {
                campaign: {
                  data:
                    { type: 'campaigns', id: `${campaign1.id}` },
                },
                assessment: {
                  data:
                    { type: 'assessments', id: `${campaignParticipation1.assessmentId}` },
                },

              },
            },
          ],
          included: [
            {
              type: 'campaigns',
              id: `${campaign2.id}`,
              attributes: {
                code: campaign2.code,
                title: campaign2.title,
              }
            },
            {
              type: 'campaigns',
              id: `${campaign1.id}`,
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
