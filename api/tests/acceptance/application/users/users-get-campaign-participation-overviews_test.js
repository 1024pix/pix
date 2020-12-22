const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
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
    let campaignParticipationToShare;
    let options;

    beforeEach(() => {
      user = databaseBuilder.factory.buildUser();
      userId = user.id;

      organization1 = databaseBuilder.factory.buildOrganization({ name: 'My organization' });
      campaign1 = databaseBuilder.factory.buildCampaign({ organizationId: organization1.id, title: 'My campaign', code: 'mycode' });
      const oldDate = new Date('2018-02-03T01:02:03Z');
      campaignParticipationToShare = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign1.id,
        createdAt: oldDate,
        isShared: false,
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipationToShare.id });

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participation-overviews`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      return databaseBuilder.commit();
    });

    context('when user has only one campaign', () => {
      it('should return found user with 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedData = [{
          type: 'campaign-participation-overviews',
          id: campaignParticipationToShare.id.toString(),
          attributes: {
            'is-shared': campaignParticipationToShare.isShared,
            'shared-at': campaignParticipationToShare.sharedAt,
            'created-at': campaignParticipationToShare.createdAt,
            'organization-name': organization1.name,
            'campaign-code': campaign1.code,
            'campaign-title': campaign1.title,
            'assessment-state': 'completed',
          },
        }];
        expect(response.result.data).to.deep.equal(expectedData);
      });
    });

    context('when user has many campaigns', () => {
      let organization2;
      let campaign2;
      let campaignParticipationStarted;

      beforeEach(() => {
        organization2 = databaseBuilder.factory.buildOrganization({ name: 'My organization' });
        campaign2 = databaseBuilder.factory.buildCampaign({ organizationId: organization2.id, title: 'My campaign', code: 'mycode' });
        const oldDate = new Date('2018-05-05T01:02:03Z');
        campaignParticipationStarted = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign2.id,
          createdAt: oldDate,
          isShared: false,
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipationStarted.id, state: Assessment.states.STARTED });

        options = {
          method: 'GET',
          url: `/api/users/${userId}/campaign-participation-overviews?filter[state]=ONGOING`,
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
          id: campaignParticipationStarted.id.toString(),
          attributes: {
            'is-shared': campaignParticipationStarted.isShared,
            'shared-at': campaignParticipationStarted.sharedAt,
            'created-at': campaignParticipationStarted.createdAt,
            'organization-name': organization2.name,
            'campaign-code': campaign2.code,
            'campaign-title': campaign2.title,
            'assessment-state': 'started',
          },
        }];
        expect(response.result.data).to.deep.equal(expectedData);
      });
    });

  });

});
