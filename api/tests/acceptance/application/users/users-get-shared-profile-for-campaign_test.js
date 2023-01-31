const _ = require('lodash');
const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | GET /users/{userId}/campaigns/{campaignId}/profile', function () {
  const userId = 100;
  const competenceId = 'recAbe382T0e1337';
  const createdAt = new Date('2019-01-01');
  const createdAfterAt = new Date('2019-01-03');
  const sharedAt = new Date('2019-01-02');
  const pixScore = 2;

  let campaignParticipation;
  let options;
  let server;

  const learningContent = {
    areas: [
      {
        id: 'recvoGdo7z2z7pXWa',
        title_i18n: {
          fr: 'Information et données',
        },
        color: 'jaffa',
        code: '1',
        competenceIds: [competenceId],
      },
    ],
    competences: [
      {
        id: competenceId,
        name_i18n: {
          fr: 'Mener une recherche et une veille d’information',
        },
        index: '1.1',
        origin: 'Pix',
        areaId: 'recvoGdo7z2z7pXWa',
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /users/{userId}/campaigns/{campaignId}/profile', function () {
    beforeEach(async function () {
      mockLearningContent(learningContent);

      databaseBuilder.factory.buildUser({ id: userId });

      const campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
        sharedAt,
        pixScore,
      });

      const knowledgeElements = [
        { skillId: 'url1', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt, userId },
        {
          skillId: 'url2',
          status: 'validated',
          source: 'direct',
          competenceId,
          earnedPix: 2,
          createdAt: createdAfterAt,
          userId,
        },
      ];
      _.each(knowledgeElements, (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaigns/${campaign.id}/profile`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
    });

    describe('Success case', function () {
      it('should return score cards for the shared profile with 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: {
            id: String(campaignParticipation.id),
            attributes: {
              'pix-score': 2,
              'shared-at': sharedAt,
              'can-retry': false,
              'max-reachable-level': 5,
              'max-reachable-pix-score': 640,
            },
            relationships: {
              scorecards: {
                data: [
                  {
                    id: '100_recAbe382T0e1337',
                    type: 'scorecards',
                  },
                ],
              },
            },
            type: 'SharedProfileForCampaigns',
          },
          included: [
            {
              attributes: {
                code: '1',
                color: 'jaffa',
                title: 'Information et données',
              },
              id: 'recvoGdo7z2z7pXWa',
              type: 'areas',
            },
            {
              attributes: {
                'competence-id': 'recAbe382T0e1337',
                description: undefined,
                'earned-pix': 2,
                index: '1.1',
                level: 0,
                name: 'Mener une recherche et une veille d’information',
                'pix-score-ahead-of-next-level': 2,
                status: 'STARTED',
              },
              id: '100_recAbe382T0e1337',
              relationships: {
                area: {
                  data: {
                    id: 'recvoGdo7z2z7pXWa',
                    type: 'areas',
                  },
                },
              },
              type: 'scorecards',
            },
          ],
        });
      });
    });
  });
});
