const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-campaign-participation-overviews', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/1/campaign-participation-overviews', () => {

    let userId;
    let sharableCampaignParticipationElements;
    let options;

    beforeEach(() => {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;
      return databaseBuilder.commit();
    });

    context('when user has only one campaign participation', () => {

      beforeEach(() => {
        sharableCampaignParticipationElements = databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: 1,
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2018-05-05T01:02:03Z'),
        });

        options = {
          method: 'GET',
          url: `/api/users/${userId}/campaign-participation-overviews`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        return databaseBuilder.commit();
      });

      it('should return found campaign participation with 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedData = [{
          type: 'campaign-participation-overviews',
          id: sharableCampaignParticipationElements.campaignParticipation.id.toString(),
          attributes: {
            'is-shared': sharableCampaignParticipationElements.campaignParticipation.isShared,
            'shared-at': sharableCampaignParticipationElements.campaignParticipation.sharedAt,
            'created-at': sharableCampaignParticipationElements.campaignParticipation.createdAt,
            'organization-name': sharableCampaignParticipationElements.organization.name,
            'campaign-code': sharableCampaignParticipationElements.campaign.code,
            'campaign-title': sharableCampaignParticipationElements.campaign.title,
            'assessment-state': Assessment.states.COMPLETED,
            'mastery-percentage': null,
          },
        }];
        expect(response.result.data).to.deep.equal(expectedData);
      });
    });

    context('when user has many campaign participations', () => {

      let startedCampaignParticipationElements;
      let sharableCampaignParticipationElements;

      beforeEach(() => {

        startedCampaignParticipationElements = databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: 1,
          isShared: false,
          lastAssessmentState: Assessment.states.STARTED,
          campaignParticipationCreatedAt: new Date('2018-05-05T01:04:03Z'),
        });

        sharableCampaignParticipationElements = databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: 2,
          isShared: false,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2018-05-05T01:03:03Z'),
        });

        databaseBuilder.factory.buildCampaignParticipationElementsForOverview({
          userId,
          index: 3,
          isShared: true,
          lastAssessmentState: Assessment.states.COMPLETED,
          campaignParticipationCreatedAt: new Date('2018-05-05T01:02:03Z'),
        });

        return databaseBuilder.commit();
      });

      describe('When campaign participation overviews are filtered', () =>{
        it('should return only the ongoing campaign participation overviews with 200 HTTP status code', async () => {
          // given
          options = {
            method: 'GET',
            url: `/api/users/${userId}/campaign-participation-overviews?filter[states][]=ONGOING`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const expectedData = [{
            type: 'campaign-participation-overviews',
            id: startedCampaignParticipationElements.campaignParticipation.id.toString(),
            attributes: {
              'is-shared': startedCampaignParticipationElements.campaignParticipation.isShared,
              'shared-at': startedCampaignParticipationElements.campaignParticipation.sharedAt,
              'created-at': startedCampaignParticipationElements.campaignParticipation.createdAt,
              'organization-name': startedCampaignParticipationElements.organization.name,
              'campaign-code': startedCampaignParticipationElements.campaign.code,
              'campaign-title': startedCampaignParticipationElements.campaign.title,
              'assessment-state': Assessment.states.STARTED,
              'mastery-percentage': null,
            },
          }];
          expect(response.result.data).to.deep.equal(expectedData);
        });

        it('should return only the ongoing and the sharable campaign participation overviews with 200 HTTP status code', async () => {
          // given
          options = {
            method: 'GET',
            url: `/api/users/${userId}/campaign-participation-overviews?filter[states][]=ONGOING&filter[states][]=TO_SHARE`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const expectedData = [
            {
              type: 'campaign-participation-overviews',
              id: sharableCampaignParticipationElements.campaignParticipation.id.toString(),
              attributes: {
                'is-shared': sharableCampaignParticipationElements.campaignParticipation.isShared,
                'shared-at': sharableCampaignParticipationElements.campaignParticipation.sharedAt,
                'created-at': sharableCampaignParticipationElements.campaignParticipation.createdAt,
                'organization-name': sharableCampaignParticipationElements.organization.name,
                'campaign-code': sharableCampaignParticipationElements.campaign.code,
                'campaign-title': sharableCampaignParticipationElements.campaign.title,
                'assessment-state': Assessment.states.COMPLETED,
                'mastery-percentage': null,
              },
            }, {
              type: 'campaign-participation-overviews',
              id: startedCampaignParticipationElements.campaignParticipation.id.toString(),
              attributes: {
                'is-shared': startedCampaignParticipationElements.campaignParticipation.isShared,
                'shared-at': startedCampaignParticipationElements.campaignParticipation.sharedAt,
                'created-at': startedCampaignParticipationElements.campaignParticipation.createdAt,
                'organization-name': startedCampaignParticipationElements.organization.name,
                'campaign-code': startedCampaignParticipationElements.campaign.code,
                'campaign-title': startedCampaignParticipationElements.campaign.title,
                'assessment-state': Assessment.states.STARTED,
                'mastery-percentage': null,
              },
            }];
          expect(response.result.data).to.deep.equal(expectedData);
        });
      });

      describe('When campaign participation overviews are paginated', () =>{
        it('should paginate the result with 200 HTTP status code', async () => {
          // given
          options = {
            method: 'GET',
            url: `/api/users/${userId}/campaign-participation-overviews?page[number]=0&page[size]=2`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(2);
        });
      });

    });

  });

});
