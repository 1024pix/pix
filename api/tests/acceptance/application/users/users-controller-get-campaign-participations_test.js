import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | GET /user/id/campaign-participations', function () {
  let userId;
  let campaign1;
  let campaign2;
  let campaign3;
  let campaignParticipation1;
  let campaignParticipation2;
  let campaignParticipation3;
  let assessment1;
  let assessment2;
  let options;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /users/:id/campaign-participations', function () {
    beforeEach(function () {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;

      campaign1 = databaseBuilder.factory.buildCampaign();
      const oldDate = new Date('2018-02-03T01:02:03Z');
      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign1.id,
        createdAt: oldDate,
        status: 'STARTED',
      });

      campaign2 = databaseBuilder.factory.buildCampaign();
      const recentDate = new Date('2018-05-06T01:02:03Z');
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign2.id,
        createdAt: recentDate,
        status: 'SHARED',
      });

      campaign3 = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
      const middleDate = new Date('2018-04-06T01:02:03Z');
      campaignParticipation3 = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign3.id,
        createdAt: middleDate,
        status: 'SHARED',
      });

      assessment1 = databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation1.id });
      assessment2 = databaseBuilder.factory.buildAssessment({ campaignParticipationId: campaignParticipation2.id });

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should return found campaign-participations with 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'campaign-participations',
              id: campaignParticipation2.id.toString(),
              attributes: {
                'is-shared': true,
                'participant-external-id': campaignParticipation2.participantExternalId,
                'shared-at': campaignParticipation2.sharedAt,
                'deleted-at': campaignParticipation2.deletedAt,
                'created-at': campaignParticipation2.createdAt,
              },
              relationships: {
                campaign: {
                  data: { type: 'campaigns', id: `${campaign2.id}` },
                },
                assessment: {
                  links: {
                    related: `/api/assessments/${assessment2.id}`,
                  },
                },
                trainings: {
                  links: {
                    related: `/api/campaign-participations/${campaignParticipation2.id}/trainings`,
                  },
                },
              },
            },
            {
              type: 'campaign-participations',
              id: campaignParticipation3.id.toString(),
              attributes: {
                'is-shared': true,
                'participant-external-id': campaignParticipation3.participantExternalId,
                'shared-at': campaignParticipation3.sharedAt,
                'deleted-at': campaignParticipation3.deletedAt,
                'created-at': campaignParticipation3.createdAt,
              },
              relationships: {
                campaign: {
                  data: { type: 'campaigns', id: `${campaign3.id}` },
                },
                trainings: {
                  links: {
                    related: `/api/campaign-participations/${campaignParticipation3.id}/trainings`,
                  },
                },
              },
            },
            {
              type: 'campaign-participations',
              id: campaignParticipation1.id.toString(),
              attributes: {
                'is-shared': false,
                'participant-external-id': campaignParticipation1.participantExternalId,
                'shared-at': campaignParticipation1.sharedAt,
                'deleted-at': campaignParticipation1.deletedAt,
                'created-at': campaignParticipation1.createdAt,
              },
              relationships: {
                campaign: {
                  data: { type: 'campaigns', id: `${campaign1.id}` },
                },
                assessment: {
                  links: {
                    related: `/api/assessments/${assessment1.id}`,
                  },
                },
                trainings: {
                  links: {
                    related: `/api/campaign-participations/${campaignParticipation1.id}/trainings`,
                  },
                },
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
                type: 'ASSESSMENT',
              },
            },
            {
              type: 'campaigns',
              id: campaign3.id.toString(),
              attributes: {
                code: campaign3.code,
                title: campaign3.title,
                type: 'PROFILES_COLLECTION',
              },
            },
            {
              type: 'campaigns',
              id: campaign1.id.toString(),
              attributes: {
                code: campaign1.code,
                title: campaign1.title,
                type: 'ASSESSMENT',
              },
            },
          ],
        });
      });
    });
  });
});
