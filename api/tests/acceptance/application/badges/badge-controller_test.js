const createServer = require('../../../../server');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster, learningContentBuilder, mockLearningContent } = require('../../../test-helper');

describe('Acceptance | API | Badges', () => {

  let server, options, userId, badge, badgeCriterion, badgePartnerCompetence;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/admin/badges/{id}', () => {

    beforeEach(async () => {
      userId = (await insertUserWithRolePixMaster()).id;

      const learningContent = [{
        id: 'recArea',
        competences: [{
          id: 'recCompetence',
          tubes: [{
            id: 'recTube',
            name: '@recSkill',
            practicalTitle: 'Titre pratique',
            skills: [{
              id: 'recABC123',
              nom: '@recSkill3',
            }, {
              id: 'recDEF456',
              nom: '@recSkill2',
            }],
          }],
        }],
      }];

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);

      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'Message alternatif',
        imageUrl: 'url_image',
        message: 'Bravo',
        title: 'titre du badge',
        key: 'clef du badge',
        isCertifiable: false,
      });
      badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({ badgeId: badge.id });
      badgePartnerCompetence = databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId: badge.id });

      await databaseBuilder.commit();
    });

    it('should return the badge', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/admin/badges/${badge.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      const expectedBadge = {
        data: {
          type: 'badges',
          id: badge.id.toString(),
          attributes: {
            'alt-message': 'Message alternatif',
            'is-certifiable': false,
            'image-url': 'url_image',
            message: 'Bravo',
            title: 'titre du badge',
            key: 'clef du badge',
          },
          relationships: {
            'badge-criteria': {
              data: [{
                id: badgeCriterion.id.toString(),
                type: 'badge-criteria',
              }],
            },
            'badge-partner-competences': {
              data: [{
                id: badgePartnerCompetence.id.toString(),
                type: 'badge-partner-competences',
              }],
            },
          },
        },
        included: [{
          type: 'badge-criteria',
          id: badgeCriterion.id.toString(),
          attributes: {
            scope: 'CampaignParticipation',
            threshold: 50,
          },
          relationships: {
            'partner-competences': {
              data: [],
            },
          },
        }, {
          attributes: {
            'practical-title': 'Titre pratique',
          },
          id: 'recTube',
          type: 'tubes',
          relationships: {},
        }, {
          attributes: {
            name: '@recSkill3',
            difficulty: 3,
          },
          id: 'recABC123',
          type: 'skills',
          relationships: {
            tube: {
              data: {
                id: 'recTube',
                type: 'tubes',
              },
            },
          },
        }, {
          attributes: {
            name: '@recSkill2',
            difficulty: 2,
          },
          id: 'recDEF456',
          type: 'skills',
          relationships: {
            tube: {
              data: {
                id: 'recTube',
                type: 'tubes',
              },
            },
          },
        }, {
          type: 'badge-partner-competences',
          id: badgePartnerCompetence.id.toString(),
          attributes: {
            name: 'name',
          },
          relationships: {
            skills: {
              data: [
                {
                  id: 'recABC123',
                  type: 'skills',
                },
                {
                  id: 'recDEF456',
                  type: 'skills',
                },
              ],
            },
          },
        }],
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedBadge);
    });
  });
});
