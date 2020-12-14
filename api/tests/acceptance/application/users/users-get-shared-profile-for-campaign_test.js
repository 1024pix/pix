const _ = require('lodash');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, airtableBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | GET /users/{userId}/campaigns/{campaignId}/profile', () => {
  const userId = 100;
  const competenceId = 'recAbe382T0e1337';
  const createdAt = new Date('2019-01-01');
  const createdAfterAt = new Date('2019-01-03');
  const sharedAt = new Date('2019-01-02');

  let campaignParticipation;
  let options;
  let server;
  let competence;
  let area;

  beforeEach(async () => {
    server = await createServer();
    databaseBuilder.clean();
  });

  describe('GET /users/{userId}/campaigns/{campaignId}/profile', () => {

    beforeEach(async () => {
      databaseBuilder.factory.buildUser({ id: userId });
      competence = airtableBuilder.factory.buildCompetence({ id: competenceId });

      const campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isShared: true, sharedAt });

      area = airtableBuilder.factory.buildArea();
      airtableBuilder.mockList({ tableName: 'Domaines' }).returns([area]).activate();
      airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence]).activate();

      const knowledgeElements = [
        { skillId: 'url1', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt, userId },
        { skillId: 'url2', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt: createdAfterAt, userId },
      ];
      _.each(knowledgeElements, (ke) => databaseBuilder.factory.buildKnowledgeElement(ke));

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaigns/${campaign.id}/profile`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      return databaseBuilder.commit();
    });

    afterEach(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    describe('Success case', () => {
      it('should return score cards for the shared profile with 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          'data': {
            'id': String(campaignParticipation.id),
            'attributes': {
              'pix-score': 2,
              'shared-at': sharedAt,
            },
            'relationships': {
              'scorecards': {
                'data': [
                  {
                    'id': '100_recAbe382T0e1337',
                    'type': 'scorecards',
                  },
                ],
              },
            },
            'type': 'SharedProfileForCampaigns',
          },
          'included': [
            {
              'attributes': {
                'code': '1',
                'color': 'jaffa',
                'title': 'Information et données',
              },
              'id': 'recvoGdo7z2z7pXWa',
              'type': 'areas',
            },
            {
              'attributes': {
                'competence-id': 'recAbe382T0e1337',
                'description': undefined,
                'earned-pix': 2,
                'index': '1.1',
                'level': 0,
                'name': 'Mener une recherche et une veille d’information',
                'pix-score-ahead-of-next-level': 2,
                'status': 'STARTED',
              },
              'id': '100_recAbe382T0e1337',
              'relationships': {
                'area': {
                  'data': {
                    'id': 'recvoGdo7z2z7pXWa',
                    'type': 'areas',
                  },
                },
              },
              'type': 'scorecards',
            },
          ],
        });
      });
    });
  });
});
