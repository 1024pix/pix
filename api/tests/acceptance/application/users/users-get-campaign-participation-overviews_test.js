const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-campaign-participation-overviews', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/1/campaign-participation-overviews', () => {

    let user;
    let userId;
    let organization1;
    let campaign1;
    let campaignParticipation1;
    let options;

    beforeEach(() => {
      user = databaseBuilder.factory.buildUser();
      userId = user.id;

      organization1 = databaseBuilder.factory.buildOrganization({ name: 'My organization' });
      campaign1 = databaseBuilder.factory.buildCampaign({ organizationId: organization1.id, title: 'My campaign', code: 'mycode' });
      const oldDate = new Date('2018-02-03T01:02:03Z');
      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign1.id,
        createdAt: oldDate,
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation1.id });

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participation-overviews`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      return databaseBuilder.commit();
    });

    it('should return found user with 200 HTTP status code', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedData = [{
        type: 'campaign-participation-overviews',
        id: campaignParticipation1.id.toString(),
        attributes: {
          'is-shared': campaignParticipation1.isShared,
          'shared-at': campaignParticipation1.sharedAt,
          'created-at': campaignParticipation1.createdAt,
          'organization-name': organization1.name,
          'campaign-code': campaign1.code,
          'campaign-title': campaign1.title,
          'assessment-state': 'completed',
        },
      }];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });

});
